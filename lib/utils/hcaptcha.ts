/**
 * hCaptcha Verification Utility
 * Backend verification for hCaptcha tokens
 */

export interface HCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
}

/**
 * Verify hCaptcha token with backend
 * This should be called from your backend/serverless function
 */
export const verifyHCaptchaToken = async (token: string): Promise<HCaptchaVerifyResponse> => {
  // External captcha verification is disabled in this project.
  // If needed, implement verification on the backend only.
  console.warn('hCaptcha verification is disabled (no external APIs).');
  return { success: false, 'error-codes': ['disabled'] };
};

/**
 * Client-side validation before backend verification
 */
export const validateHCaptchaToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }
  
  // Basic validation: token should be a non-empty string
  return typeof token === 'string' && token.length > 0;
};

/**
 * Get hCaptcha error message in Arabic
 */
export const getHCaptchaErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'missing-input-secret': 'مفتاح hCaptcha السري مفقود',
    'invalid-input-secret': 'مفتاح hCaptcha السري غير صحيح',
    'missing-input-response': 'رمز التحقق مفقود',
    'invalid-input-response': 'رمز التحقق غير صحيح',
    'bad-request': 'طلب غير صحيح',
    'invalid-or-already-seen-response': 'رمز التحقق مستخدم من قبل',
    'not-using-dummy-passcode': 'استخدم رمز تحقق حقيقي',
    'sitekey-secret-mismatch': 'عدم تطابق المفاتيح'
  };

  return errorMessages[errorCode] || 'فشل التحقق من hCaptcha';
};
