import { prisma } from '../config/prisma';
import { env } from '../config/env';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export type AuthTokenPayload = {
  sub: number;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

const MOCK_ADMIN = {
  id: 1,
  name: 'Administrador',
  email: 'admin@evaatelie.com.br',
  password: 'admin123456',
  role: 'super',
};

export class AuthService {
  static async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (env.MOCK_MODE) {
      if (cleanEmail === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
        const payload: AuthTokenPayload = {
          sub: MOCK_ADMIN.id,
          name: MOCK_ADMIN.name,
          email: MOCK_ADMIN.email,
          role: MOCK_ADMIN.role,
        };
        const token = jwt.sign(payload, env.JWT_SECRET, {
          expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
          issuer: 'eva-atelie-auth',
        });
        return {
          ok: true as const,
          data: {
            token,
            user: {
              id: MOCK_ADMIN.id,
              name: MOCK_ADMIN.name,
              email: MOCK_ADMIN.email,
              role: MOCK_ADMIN.role,
            },
          },
        };
      }
      return { ok: false as const, error: 'Credenciais invalidas (mock)', code: 401 };
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true, role: true, passwordHash: true },
    });

    if (!user) {
      return { ok: false as const, error: 'Credenciais invalidas', code: 401 };
    }

    const match = await argon2.verify(user.passwordHash, password);
    if (!match) {
      return { ok: false as const, error: 'Credenciais invalidas', code: 401 };
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'eva-atelie-auth',
    });

    return {
      ok: true as const,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    };
  }

  static verifyToken(token: string): AuthTokenPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'eva-atelie-auth',
      }) as unknown as AuthTokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }
}
