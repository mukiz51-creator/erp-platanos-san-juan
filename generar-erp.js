const fs = require('fs');
const path = require('path');

const basePath = './backend/src';

// Crear carpetas
const folders = [
  'auth/dtos', 'auth/services', 'auth/guards', 'auth/decorators', 'auth/strategies',
  'usuarios/dtos', 'usuarios/services', 'usuarios/controllers',
  'clientes/dtos', 'clientes/services', 'clientes/controllers',
  'productos/dtos', 'productos/services', 'productos/controllers',
  'ventas/dtos', 'ventas/services', 'ventas/controllers',
  'inventario/dtos', 'inventario/services', 'inventario/controllers',
  'creditos/dtos', 'creditos/services', 'creditos/controllers',
  'reportes/dtos', 'reportes/services', 'reportes/controllers',
  'crm/dtos', 'crm/services', 'crm/controllers',
  'common/services'
];

folders.forEach(folder => {
  const fullPath = path.join(basePath, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Carpeta creada: ${folder}`);
  }
});

// Crear archivo placeholder
const placeholderContent = `// Placeholder - Archivo será reemplazado\nexport class Placeholder {}\n`;

const files = [
  'auth/dtos/auth.dto.ts',
  'auth/services/auth.service.ts',
  'auth/auth.module.ts',
  'usuarios/dtos/usuarios.dto.ts',
  'usuarios/services/usuarios.service.ts',
  'usuarios/usuarios.module.ts',
  'clientes/dtos/clientes.dto.ts',
  'clientes/services/clientes.service.ts',
  'clientes/clientes.module.ts',
  'productos/dtos/productos.dto.ts',
  'productos/services/productos.service.ts',
  'productos/productos.module.ts',
  'ventas/dtos/ventas.dto.ts',
  'ventas/services/ventas.service.ts',
  'ventas/ventas.module.ts',
  'inventario/dtos/inventario.dto.ts',
  'inventario/services/inventario.service.ts',
  'inventario/inventario.module.ts',
  'creditos/dtos/creditos.dto.ts',
  'creditos/services/creditos.service.ts',
  'creditos/creditos.module.ts',
  'reportes/dtos/reportes.dto.ts',
  'reportes/services/reportes.service.ts',
  'reportes/reportes.module.ts',
  'crm/dtos/crm.dto.ts',
  'crm/services/crm.service.ts',
  'crm/crm.module.ts',
  'common/services/prisma.service.ts'
];

files.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, placeholderContent);
    console.log(`✅ Archivo creado: ${file}`);
  }
});

console.log('\n🎉 Estructura generada exitosamente!');
console.log('📋 Ahora necesitas:');
console.log('1. Crear carpeta prisma/');
console.log('2. Crear archivo .env');
console.log('3. Crear schema.prisma');