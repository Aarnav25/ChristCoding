import { config } from '../config';

export type LoginResponse = { email: string; role: 'admin' | 'student' };

export const authService = {
  async signup(email: string, password: string) {
    const res = await fetch(`${config.API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },
  async login(email: string, password: string) {
    const res = await fetch(`${config.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
};
