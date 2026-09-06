import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear roles
  console.log('👥 Creando roles...');
  await prisma.role.create({
    data: {
      nombre: 'Admin',
      descripcion: 'Administrador del sistema'
    }
  });

  await prisma.role.create({
    data: {
      nombre: 'Gerente',
      descripcion: 'Gerente de negocio'
    }
  });

  await prisma.role.create({
    data: {
      nombre: 'Vendedor',
      descripcion: 'Vendedor'
    }
  });

  // Crear usuarios
  console.log('👤 Creando usuarios...');
  const hashedPasswordAdmin = await bcrypt.hash('Admin123!', 10);
  const hashedPasswordVendedor = await bcrypt.hash('Vendedor123!', 10);

  await prisma.usuario.create({
    data: {
      email: 'admin@platanos.com',
      nombre: 'Admin',
      apellidos: 'Sistema',
      contraseña: hashedPasswordAdmin
    }
  });

  await prisma.usuario.create({
    data: {
      email: 'vendedor@platanos.com',
      nombre: 'Juan',
      apellidos: 'Vendedor',
      contraseña: hashedPasswordVendedor
    }
  });

  console.log('✅ Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
