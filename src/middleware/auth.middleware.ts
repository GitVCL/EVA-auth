import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';

export const loginRateLimiter = rateLimit({
  windowMs: env.LOGIN_WINDOW_MS,
  max: env.LOGIN_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
});

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Token nao fornecido' });
  }

  const token = header.slice(7);
  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ ok: false, error: 'Token invalido ou expirado' });
  }

  (req as any).user = decoded;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Nao autorizado' });
  }
  if (user.role !== 'admin' && user.role !== 'super') {
    return res.status(403).json({ ok: false, error: 'Permissao negada' });
  }
  next();
}
