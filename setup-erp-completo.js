const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando setup completo del ERP...\n');

// 1. CREAR CARPETA PRISMA
const prismaPath = './prisma';
if (!fs.existsSync(prismaPath)) {
  fs.mkdirSync(prismaPath, { recursive: true });
  console.log('✅ Carpeta prisma/ creada');
}

// 2. CREAR .env
const envContent = `DATABASE_URL="postgresql://postgres:password@localhost:5432/platanos_san_juan"
JWT_SECRET="your-super-secret-key-change-this-in-production-12345"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3001
NODE_ENV="development"
API_PREFIX="api"
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
`;

fs.writeFileSync('./backend/.env', envContent);
console.log('✅ Archivo .env creado');

// 3. CREAR .env.example
fs.writeFileSync('./backend/.env.example', envContent.replace('password@localhost', 'YOUR_PASSWORD@YOUR_HOST'));
console.log('✅ Archivo .env.example creado');

// 4. CREAR schema.prisma
const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id            String   @id @default(cuid())
  email         String   @unique
  nombre        String
  apellidos     String?
  contraseña    String
  activo        Boolean  @default(true)
  creado_en     DateTime @default(now())
  actualizado_en DateTime @updatedAt
  
  @@map("usuarios")
}

model Role {
  id          String   @id @default(cuid())
  nombre      String   @unique
  descripcion String?
  creado_en   DateTime @default(now())
  
  @@map("roles")
}

model Permiso {
  id          String   @id @default(cuid())
  nombre      String   @unique
  descripcion String?
  creado_en   DateTime @default(now())
  
  @@map("permisos")
}

model Cliente {
  id                    String   @id @default(cuid())
  razon_social          String
  nit                   String   @unique
  tipo                  String
  telefono              String?
  email                 String?
  credito_maximo        Float    @default(0)
  credito_disponible    Float    @default(0)
  latitud               Float?
  longitud              Float?
  estado                String   @default("activo")
  creado_en             DateTime @default(now())
  actualizado_en        DateTime @updatedAt
  
  @@map("clientes")
}

model Producto {
  id                String   @id @default(cuid())
  codigo            String   @unique
  nombre            String
  descripcion       String?
  precio_base       Float
  unidad_medida     String
  categoria         String
  estado            String   @default("activo")
  creado_en         DateTime @default(now())
  actualizado_en    DateTime @updatedAt
  
  @@map("productos")
}

model Venta {
  id                  String   @id @default(cuid())
  numero              String   @unique
  cliente_id          String
  tipo                String
  metodo_pago         String
  total_sin_impuestos Float
  iva                 Float    @default(0.16)
  descuento           Float    @default(0)
  total_con_impuestos Float
  estado              String   @default("completada")
  creado_en           DateTime @default(now())
  actualizado_en      DateTime @updatedAt
  
  @@map("ventas")
}

model Inventario {
  id               String   @id @default(cuid())
  producto_id      String
  cantidad         Float    @default(0)
  cantidad_minima  Float    @default(5)
  cantidad_maxima  Float    @default(100)
  actualizado_en   DateTime @updatedAt
  
  @@map("inventario")
}

model Credito {
  id                String   @id @default(cuid())
  numero            String   @unique
  cliente_id        String
  monto             Float
  saldo_deudor      Float
  tasa_interes      Float    @default(0.02)
  interes_acumulado Float   @default(0)
  plazo_dias        Int      @default(30)
  fecha_vencimiento DateTime
  estado            String   @default("vigente")
  creado_en         DateTime @default(now())
  actualizado_en    DateTime @updatedAt
  
  @@map("creditos")
}

model Ruta {
  id          String   @id @default(cuid())
  nombre      String
  descripcion String?
  vendedor_id String
  estado      String   @default("activa")
  creado_en   DateTime @default(now())
  
  @@map("rutas")
}

model BitacoraAuditoria {
  id          String   @id @default(cuid())
  usuario_id  String?
  accion      String
  tabla       String
  registro_id String
  creado_en   DateTime @default(now())
  
  @@map("bitacora_auditoria")
}
`;

fs.writeFileSync('./prisma/schema.prisma', schemaContent);
console.log('✅ Archivo schema.prisma creado');

// 5. CREAR seed.ts
const seedContent = `import { PrismaClient } from '@prisma/client';
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
`;

fs.writeFileSync('./prisma/seed.ts', seedContent);
console.log('✅ Archivo seed.ts creado');

// 6. CREAR app.module.ts
const appModuleContent = `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './common/services/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
`;

fs.writeFileSync('./backend/src/app.module.ts', appModuleContent);
console.log('✅ Archivo app.module.ts actualizado');

// 7. CREAR main.ts
const mainContent = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(\`✅ Servidor corriendo en http://localhost:\${port}/\${process.env.API_PREFIX || 'api'}\`);
}

bootstrap();
`;

fs.writeFileSync('./backend/src/main.ts', mainContent);
console.log('✅ Archivo main.ts actualizado');

// 8. CREAR prisma.service.ts
const prismaServiceContent = `import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async validateConnection() {
    try {
      await this.$queryRaw\`SELECT 1\`;
    } catch (error) {
      throw new BadRequestException('No se pudo conectar a la base de datos');
    }
  }
}
`;

fs.writeFileSync('./backend/src/common/services/prisma.service.ts', prismaServiceContent);
console.log('✅ Archivo prisma.service.ts creado');

// 9. ACTUALIZAR package.json
const packageJsonPath = './backend/package.json';
let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.seed = 'ts-node prisma/seed.ts';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json actualizado con script seed');

console.log('\n🎉 ¡Setup completado exitosamente!');
console.log('\n📋 Próximos pasos:');
console.log('1. cd backend');
console.log('2. npx prisma generate');
console.log('3. npx prisma migrate dev --name init');
console.log('4. npx prisma db seed');
console.log('5. npm run start:dev');
console.log('\n✨ ¡Tu ERP está listo para usar!');