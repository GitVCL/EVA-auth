import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function bootstrap() {
  try {
    if (env.MOCK_MODE) {
      console.log('🧪 [AUTH] MOCK MODE ATIVO - MySQL ignorado');
    } else {
      await prisma.$connect();
      console.log('🔐 [AUTH] Prisma conectado ao MySQL (tabela users)');
    }

    app.listen(env.PORT, () => {
      console.log(`🚀 EVA ATELIÊ AUTH rodando em http://localhost:${env.PORT}`);
      console.log(`   Ambiente:  ${env.NODE_ENV} | Mock: ${env.MOCK_MODE ? 'SIM' : 'NAO'}`);
      console.log(`   Health:    http://localhost:${env.PORT}/api/health`);
      console.log(`   Login:     http://localhost:${env.PORT}/api/auth/login`);
      if (env.MOCK_MODE) {
        console.log(`   MOCK Login: admin@evaatelie.com.br / admin123456`);
      }
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar servico AUTH:', err);
    process.exit(1);
  }
}

bootstrap();
