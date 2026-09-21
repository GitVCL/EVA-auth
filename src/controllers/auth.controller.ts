import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';

const loginSchema = z.object({
  email: z.string().email('E-mail invalido').min(1),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          error: 'Dados invalidos',
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const { email, password } = parsed.data;
      const result = await AuthService.login(email, password);

      if (!result.ok) {
        return res.status(result.code).json({ ok: false, error: result.error });
      }

      return res.json({
        ok: true,
        token: result.data.token,
        user: result.data.user,
      });
    } catch (err) {
      console.error('[AUTH LOGIN ERROR]', err);
      return res.status(500).json({ ok: false, error: 'Erro interno no servidor' });
    }
  }

  static async me(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Nao autorizado' });
    }
    return res.json({ ok: true, user });
  }
}
