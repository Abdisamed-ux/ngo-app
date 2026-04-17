import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export class PasswordService {
  /**
   * Hashes a plaintext password with a cost factor of 12.
   */
  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verifies a plaintext password against a stored hash.
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
