import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../config/env';
import { UserRole } from '../../core/constants/roles';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: UserPayload): string {
    if (!config.jwtSecret) {
      throw new Error('JWT secret is not configured');
    }
    const options: SignOptions = { expiresIn: config.jwtExpiresIn as any };
    return jwt.sign(payload, config.jwtSecret as jwt.Secret, options);
  }

  static verifyToken(token: string): UserPayload {
    if (!config.jwtSecret) {
      throw new Error('JWT secret is not configured');
    }

    const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret);
    if (typeof decoded !== 'object' || decoded === null) {
      throw new Error('Invalid token payload');
    }

    const anyDecoded = decoded as any;
    if (typeof anyDecoded.id !== 'string' || typeof anyDecoded.email !== 'string' || typeof anyDecoded.role !== 'string') {
      throw new Error('Invalid token payload');
    }

    return {
      id: anyDecoded.id,
      email: anyDecoded.email,
      role: anyDecoded.role as UserRole
    };
  }
}
