import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export class JwtService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key';

  static generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: '15m' };
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, options);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: '7d' };
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JwtPayload;
  }
}
