/**
 * Security Utilities
 */

import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key-change-in-production';

// Encrypt data before storing in localStorage
export const encryptData = (data: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return data;
  }
};

// Decrypt data from localStorage
export const decryptData = (encryptedData: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData;
  }
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: string) => {
    const encrypted = encryptData(value);
    localStorage.setItem(key, encrypted);
  },
  
  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decryptData(encrypted);
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

// CSRF Token Management
let csrfToken: string | null = null;

export const generateCSRFToken = (): string => {
  csrfToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessionStorage.setItem('csrf-token', csrfToken);
  return csrfToken;
};

export const getCSRFToken = (): string | null => {
  if (!csrfToken) {
    csrfToken = sessionStorage.getItem('csrf-token');
  }
  return csrfToken;
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return token === storedToken;
};

// Rate Limiting (Client-side)
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (key: string, config: RateLimitConfig): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    });
    return true;
  }
  
  if (record.count >= config.maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};

// XSS Protection
export const sanitizeHTML = (html: string): string => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

// Input Validation
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
