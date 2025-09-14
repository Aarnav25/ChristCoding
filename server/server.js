const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuration with defaults
const config = {
  port: process.env.PORT || 4000,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/iwp_database',
  pgSsl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER
  }
};
const multer = require('multer');
const pdfParse = require('pdf-parse');
require('dotenv').config({ override: true, path: __dirname + '/.env' });

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Postgres
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.pgSsl,
});

async function initTables() {
  await pool.query('create extension if not exists "uuid-ossp"');
  await pool.query(`create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    password_hash text not null,
    role text not null default 'student',
    created_at timestamptz not null default now()
  )`);
  await pool.query(`create table if not exists questions (
    id uuid primary key default gen_random_uuid(),
    text text not null,
    options text[] not null,
    answer_index int not null,
    created_at timestamptz not null default now()
  )`);
  await pool.query(`create table if not exists attempts (
    id uuid primary key default gen_random_uuid(),
    student_email text not null,
    test_id text,
    score int not null,
    total int not null,
    taken_at timestamptz not null default now()
  )`);
}
initTables().catch((e) => console.error('[db init] error:', e));

// Auth routes
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const pwHash = await bcrypt.hash(password, config.bcryptRounds);
    const isAdminEmail = email.toLowerCase() === config.adminEmail.toLowerCase();
    const role = isAdminEmail ? 'admin' : 'student';

    // Try insert
    const insert = await pool.query(
      'insert into users (email, password_hash, role) values ($1, $2, $3) on conflict (email) do nothing returning id, email, role',
      [email.toLowerCase(), pwHash, role]
    );
    if (insert.rows.length) return res.json(insert.rows[0]);

    // If exists, optionally promote to admin if needed
    const existing = await pool.query('select id, email, role from users where email=$1', [email.toLowerCase()]);
    if (!existing.rows.length) return res.status(500).json({ error: 'Signup failed' });

    if (isAdminEmail && existing.rows[0].role !== 'admin') {
      const upd = await pool.query('update users set role=\'admin\' where email=$1 returning id, email, role', [email.toLowerCase()]);
      return res.json(upd.rows[0]);
    }

    return res.status(409).json({ error: 'Email already exists' });
  } catch (e) {
    console.error('[signup] error', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('select id, email, password_hash, role from users where email=$1', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const effectiveRole = email.toLowerCase() === config.adminEmail.toLowerCase() ? 'admin' : user.role;
    res.json({ id: user.id, email: user.email, role: effectiveRole });
  } catch (e) {
    console.error('[login] error', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Health route for quick checks
app.get('/', async (_req, res) => {
  try {
    await pool.query('select 1');
    res.json({ ok: true, service: 'dcc-mailer', db: 'ok', routes: ['POST /send-score', 'GET/POST/PUT/DELETE /questions', 'POST /attempts', 'GET /attempts/by-student', 'POST /auth/signup', 'POST /auth/login'], env: { host: process.env.SMTP_HOST, port: process.env.SMTP_PORT } });
  } catch (e) {
    res.json({ ok: false, error: String(e) });
  }
});

// Questions API (Postgres)
app.get('/questions', async (_req, res) => {
  const { rows } = await pool.query('select id, text, options, answer_index from questions order by created_at desc');
  res.json(rows.map(r => ({ id: r.id, text: r.text, options: r.options, answerIndex: r.answer_index })));
});
app.post('/questions', async (req, res) => {
  const { text, options, answerIndex } = req.body;
  if (!text || !Array.isArray(options) || typeof answerIndex !== 'number') return res.status(400).json({ error: 'Invalid payload' });
  const { rows } = await pool.query('insert into questions (text, options, answer_index) values ($1, $2, $3) returning id, text, options, answer_index', [text, options, answerIndex]);
  const r = rows[0];
  res.status(201).json({ id: r.id, text: r.text, options: r.options, answerIndex: r.answer_index });
});
app.put('/questions/:id', async (req, res) => {
  const { id } = req.params;
  const { text, options, answerIndex } = req.body;
  const { rows } = await pool.query('update questions set text=$1, options=$2, answer_index=$3 where id=$4 returning id, text, options, answer_index', [text, options, answerIndex, id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const r = rows[0];
  res.json({ id: r.id, text: r.text, options: r.options, answerIndex: r.answer_index });
});
app.delete('/questions/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('delete from questions where id=$1', [id]);
  res.json({ ok: true });
});

// Attempts API
app.post('/attempts', async (req, res) => {
  const { studentEmail, testId, score, total } = req.body;
  const { rows } = await pool.query('insert into attempts (student_email, test_id, score, total) values ($1, $2, $3, $4) returning *', [studentEmail, testId, score, total]);
  res.json(rows[0]);
});
app.get('/attempts/by-student', async (req, res) => {
  const email = req.query.email;
  const { rows } = await pool.query('select * from attempts where student_email = $1 order by taken_at desc', [email]);
  res.json(rows);
});

app.get('/attempts/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'query required' });
    const query = `%${q}%`;
    const result = await pool.query(
      'select * from attempts where student_email ilike $1 order by taken_at desc limit 50',
      [query]
    );
    res.json(result.rows);
  } catch (e) {
    console.error('[attempts/search]', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Get all users (admin only)
app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'select id, email, role, created_at from users order by created_at desc'
    );
    res.json(rows);
  } catch (e) {
    console.error('[users] error', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Create reusable transporter using SMTP
function createTransporter() {
  const { host, port, user, pass } = config.smtp;
  if (!host || !port || !user || !pass) {
    throw new Error('Missing SMTP configuration. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables');
  }
  console.log('[mailer] using host=%s port=%s user=%s', host, port, user);
  return nodemailer.createTransport({
    host: host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user: user, pass: pass },
  });
}

app.post('/send-score', async (req, res) => {
  try {
    const { to, testName, score, total } = req.body;
    console.log('[send-score] payload:', { to, testName, score, total });
    if (!to || typeof score !== 'number' || typeof total !== 'number') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const transporter = createTransporter();

    try {
      await transporter.verify();
    } catch (vErr) {
      console.error('[mailer] verify failed:', vErr);
    }

    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `Your ${testName || 'Test'} Score: ${score}/${total}`,
      html: `<div style="font-family:system-ui,Segoe UI,Arial">
        <h2>Great job!</h2>
        <p>You scored <strong>${score}</strong> out of <strong>${total}</strong> on ${testName || 'your test'}.</p>
        <p>Keep practicing daily to improve your skills.</p>
      </div>`,
    });
    console.log('[mailer] sent messageId=', info.messageId);
    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error('[send-score] error:', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    let text = '';
    let parseError = null;
    const fileName = req.file.originalname;
    const fileType = fileName.split('.').pop()?.toLowerCase();
    
    console.log(`[upload-pdf] Processing file: ${fileName}, type: ${fileType}, size: ${req.file.size} bytes`);
    
    // Handle different file types
    if (fileType === 'txt' || req.file.mimetype === 'text/plain') {
      // Text file - read directly
      text = req.file.buffer.toString('utf8');
      console.log('[upload-pdf] Processed as text file');
    } else if (fileType === 'pdf') {
      // PDF file - try to parse
      try {
        const data = await pdfParse(req.file.buffer);
        text = data.text.replace(/\r/g, '');
        console.log('[upload-pdf] PDF parsed successfully');
      } catch (pdfError) {
        console.error('[upload-pdf] PDF parse failed:', pdfError.message);
        parseError = pdfError.message;
        
        // Try alternative PDF parsing approaches
        try {
          // Sometimes PDFs work better with different options
          const data = await pdfParse(req.file.buffer, {
            max: 0, // No page limit
            version: 'v1.10.100' // Try different version
          });
          text = data.text.replace(/\r/g, '');
          console.log('[upload-pdf] PDF parsed with alternative method');
          parseError = null; // Clear error since it worked
        } catch (altError) {
          console.error('[upload-pdf] Alternative PDF parsing also failed:', altError.message);
          return res.status(400).json({ 
            error: 'PDF parsing failed. The PDF may be corrupted, password-protected, or have structural issues.',
            details: `Primary error: ${parseError}, Secondary error: ${altError.message}`,
            suggestions: [
              'Try re-saving the PDF in a different format',
              'Convert the PDF to a text file (.txt) with the same Q&A format',
              'Use a different PDF file',
              'Ensure the PDF is not password-protected'
            ],
            supportedFormats: ['PDF', 'TXT']
          });
        }
      }
    } else {
      return res.status(400).json({ 
        error: 'Unsupported file type',
        details: `File type '${fileType}' is not supported`,
        supportedFormats: ['PDF', 'TXT'],
        suggestion: 'Please upload a PDF or TXT file'
      });
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'No text content found in the file' });
    }

    // More flexible parsing - try multiple approaches
    let created = 0;
    const createdQuestions = [];
    
    // Approach 1: Split by double newlines first
    const rawBlocks = text.split(/\n\s*\n/);
    let blocks = rawBlocks.filter((b) => /^(Q\d+\)|\d+[\)\.])/i.test(b.trim()));
    
    // Approach 2: If that didn't work well, try splitting by question patterns
    if (blocks.length < 2) {
      const questionMatches = text.match(/(Q\d+\)|\d+[\)\.])[^]*?(?=(Q\d+\)|\d+[\)\.])|$)/gi);
      if (questionMatches && questionMatches.length > blocks.length) {
        blocks = questionMatches;
      }
    }
    
    // Approach 3: Split by lines and group by question patterns
    if (blocks.length < 2) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const newBlocks = [];
      let currentBlock = [];
      
      for (const line of lines) {
        if (/^(Q\d+\)|\d+[\)\.])/i.test(line)) {
          if (currentBlock.length > 0) {
            newBlocks.push(currentBlock.join('\n'));
          }
          currentBlock = [line];
        } else if (currentBlock.length > 0) {
          currentBlock.push(line);
        }
      }
      if (currentBlock.length > 0) {
        newBlocks.push(currentBlock.join('\n'));
      }
      
      if (newBlocks.length > blocks.length) {
        blocks = newBlocks;
      }
    }

    console.log(`[upload-pdf] Found ${blocks.length} potential question blocks`);

    for (const b of blocks) {
      const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
      // Question line can be 'Q1) ....' or '1. ....' or '1) ....'
      const qLine = lines.find((l) => /^(Q\d+\)|\d+[\)\.])/i.test(l)) || lines[0];
      let questionText = qLine
        .replace(/^(Q\d+\)\s*)/i, '')
        .replace(/^(\d+\.)\s*/, '')
        .replace(/^(\d+\))\s*/, '')
        .trim();

      const opts = [];
      for (const letter of ['A','B','C','D']) {
        const opt = lines.find((l) => new RegExp(`^${letter}[\\)\\.]\\s+`, 'i').test(l));
        if (opt) opts.push(opt.replace(/^[A-D][\)\.]\s+/i, '').trim());
      }

      let answerIndex = -1;
      // Support 'Answer: B', 'Ans: B', 'Correct: B'
      const answerLine = lines.find((l) => /(answer|ans|correct)\s*:/i.test(l));
      if (answerLine) {
        const m = answerLine.match(/(answer|ans|correct)\s*:\s*([A-D])/i);
        if (m) answerIndex = { A: 0, B: 1, C: 2, D: 3 }[m[2].toUpperCase()];
      } else {
        // Fallback: star marked option
        const starIdx = opts.findIndex((o) => /\*\s*$/.test(o));
        if (starIdx >= 0) {
          answerIndex = starIdx;
          opts[starIdx] = opts[starIdx].replace(/\*\s*$/, '').trim();
        }
      }

      console.log(`[upload-pdf] Processing block: question="${questionText}", options=${opts.length}, answer=${answerIndex}`);

      if (questionText && opts.length >= 2 && answerIndex >= 0) {
        const ins = await pool.query(
          'insert into questions (text, options, answer_index) values ($1,$2,$3) returning id, text, options, answer_index',
          [questionText, opts, answerIndex]
        );
        const r = ins.rows[0];
        createdQuestions.push({ id: r.id, text: r.text, options: r.options, answerIndex: r.answer_index });
        created++;
      }
    }

    res.json({ 
      ok: true, 
      created, 
      questions: createdQuestions, 
      scannedBlocks: rawBlocks.length, 
      matchedBlocks: blocks.length,
      parseError: parseError,
      textPreview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      fileName: fileName,
      fileType: fileType,
      fileSize: req.file.size,
      message: created > 0 ? 
        `Successfully created ${created} questions from ${fileName}` : 
        `No valid questions found in ${fileName}. Please check the format.`
    });
  } catch (e) {
    console.error('[upload-pdf]', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(config.port, () => console.log(`Server listening on http://localhost:${config.port}`));
