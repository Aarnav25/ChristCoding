import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function AdminUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const onUpload = async (file: File | null) => {
    if (!file) return;
    
    setUploading(true);
    setUploadResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('http://localhost:4000/upload-pdf', { 
        method: 'POST', 
        body: formData 
      });
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || 'Upload failed');
      }
      
      setUploadResult(json);
    } catch (e: any) {
      console.error('upload failed', e);
      setUploadResult({ error: e.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Upload Questions from PDF</h2>
      
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Upload PDF File</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload a PDF file containing questions in the following format:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm">
              <pre className="whitespace-pre-wrap">{`Q1) What is React?
A) A JavaScript library
B) A database
C) A programming language
D) An operating system
Answer: A

Q2) What does CPU stand for?
A) Central Processing Unit
B) Computer Processing Unit
C) Central Program Unit
D) Computer Program Unit
Answer: A`}</pre>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => onUpload(e.target.files?.[0] || null)}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Supported formats: PDF, TXT
            </p>
          </div>

          {uploading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Processing file...</span>
              </div>
            </div>
          )}

          {uploadResult && (
            <div className={`p-4 rounded-lg ${
              uploadResult.error 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              {uploadResult.error ? (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Upload Failed</h4>
                  <p className="text-red-700">{uploadResult.error}</p>
                  {uploadResult.suggestion && (
                    <p className="text-red-600 text-sm mt-2">{uploadResult.suggestion}</p>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Upload Successful!</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Questions Added:</span>
                      <span className="ml-1 text-green-800">{uploadResult.created}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Scanned Blocks:</span>
                      <span className="ml-1 text-green-800">{uploadResult.scannedBlocks}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Matched Blocks:</span>
                      <span className="ml-1 text-green-800">{uploadResult.matchedBlocks}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Parse Error:</span>
                      <span className="ml-1 text-green-800">{uploadResult.parseError ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  
                  {uploadResult.questions && uploadResult.questions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-green-800 mb-2">Added Questions:</h5>
                      <div className="space-y-2">
                        {uploadResult.questions.map((q: any, index: number) => (
                          <div key={q.id} className="bg-white p-3 rounded border">
                            <div className="font-medium text-sm">Q{index + 1}: {q.text}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Answer: {q.options[q.answerIndex]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadResult.textPreview && (
                    <div className="mt-4">
                      <h5 className="font-medium text-green-800 mb-2">Text Preview:</h5>
                      <div className="bg-white p-3 rounded border text-xs text-gray-700 max-h-32 overflow-y-auto">
                        {uploadResult.textPreview}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Tips for Best Results</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Use clear question numbering: Q1), 1., or 1)</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Format options as A), B), C), D) or A., B., C., D.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Include answer in format: "Answer: A" or "Ans: B"</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Separate questions with blank lines</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Avoid scanned PDFs - use text-based PDFs for best results</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
