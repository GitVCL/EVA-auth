import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, loginRateLimiter } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/login', loginRateLimiter, AuthController.login);
authRouter.get('/me', authenticate, AuthController.me);
