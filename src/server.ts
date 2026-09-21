import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

let prismaConnected = false;

async function bootstrap() {
  try {
    if (env.MOCK_MODE) {
      console.log('🧪 [AUTH] MOCK MODE ATIVO');
      prismaConnected = true;
    } else {
      try {
        await prisma.$connect();
        prismaConnected = true;
        console.log('🔐 [AUTH] Prisma conectado ao PostgreSQL (tabela users)');
      } catch (dbErr) {
        console.error('⚠️ [AUTH] AVISO: Prisma NAO conectou ainda. Servidor vai subir para HEALTHCHECK, tentando reconectar...', (dbErr as Error).message);
        prismaConnected = false;
      }
    }

    app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`🚀 EVA ATELIÊ AUTH rodando em 0.0.0.0:${env.PORT}`);
      console.log(`   Ambiente:  ${env.NODE_ENV} | Mock: ${env.MOCK_MODE ? 'SIM' : 'NAO'} | Prisma OK: ${prismaConnected ? 'SIM' : 'NAO'}`);
      console.log(`   Health:    http://0.0.0.0:${env.PORT}/api/health`);
      console.log(`   Login:     http://0.0.0.0:${env.PORT}/api/auth/login`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar servico AUTH:', err);
    process.exit(1);
  }
}

bootstrap();
