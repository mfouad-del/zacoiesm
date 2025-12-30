import jwt from 'jsonwebtoken';
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
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  }

  static verifyToken(token: string): UserPayload {
    return jwt.verify(token, config.jwtSecret) as UserPayload;
  }
}
