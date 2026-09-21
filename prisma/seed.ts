import { prisma } from '../src/config/prisma';
import { AuthService } from '../src/services/auth.service';
import { env } from '../src/config/env';

async function seed() {
  console.log('🌱 [AUTH] Iniciando seed (criacao de admin)...');

  const adminPassword = env.SEED_ADMIN_PASSWORD || 'admin123456';
  const adminEmail = env.SEED_ADMIN_EMAIL || 'admin@evaatelie.com.br';
  const adminName = env.SEED_ADMIN_NAME || 'Administrador Eva';

  const hashed = await AuthService.hashPassword(adminPassword);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash: hashed, role: 'super' },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashed,
      role: 'super',
    },
  });

  console.log('');
  console.log(`✅ Admin criado/atualizado: ${user.email}`);
  console.log(`Login admin → ${adminEmail} / ${adminPassword}`);
  console.log('⚠️  Troque a senha no primeiro acesso!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
