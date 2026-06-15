# Backend - Portal Bufete de Abogados

Node.js + Express + TypeScript backend API para el portal del bufete de abogados.

## 🚀 Características

- **API REST**: Arquitectura RESTful completa
- **Autenticación**: JWT con tokens seguros
- **Base de Datos**: SQL Server con procedimientos almacenados
- **Cifrado**: AES-256 para datos sensibles
- **Validación**: Express validator
- **Middleware**: Error handling, logging, CORS

## 📦 Instalación

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales
```

## 🏗️ Estructura

```
src/
├── routes/           # Definición de rutas
├── controllers/      # Lógica de controladores
├── services/         # Lógica de negocio
├── middleware/       # Middleware personalizado
├── models/           # Modelos de datos
├── config/           # Configuración
├── utils/            # Funciones utilitarias
├── types/            # Tipos TypeScript
└── server.ts         # Punto de entrada
```

## 🛠️ Scripts

```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🗄️ Base de Datos

### Configuración SQL Server

```env
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=password
DB_NAME=bufete_abogados
```

### Inicializar Base de Datos

```bash
cd database
sqlcmd -S localhost -U sa -P password -i 01-schema.sql
sqlcmd -S localhost -U sa -P password -d bufete_abogados -i 02-tables.sql
sqlcmd -S localhost -U sa -P password -d bufete_abogados -i 03-procedures.sql
sqlcmd -S localhost -U sa -P password -d bufete_abogados -i 04-notifications.sql
sqlcmd -S localhost -U sa -P password -d bufete_abogados -i 05-ai-conversations.sql
sqlcmd -S localhost -U sa -P password -d bufete_abogados -i 06-lawyers-schema-fix.sql
```

> **Nota:** El script `06-lawyers-schema-fix.sql` reemplaza la tabla `auth.Lawyers` con el
> schema correcto (FirstName, LastName, Specialization, Rating, etc.) e inserta abogados de ejemplo.

## 🔐 Autenticación

- Tokens JWT con claim `role` incluido
- Contraseñas con bcrypt
- Middleware `authMiddleware` para autenticación
- Middleware `requireRole` para autorización por rol

```typescript
// Uso en rutas
router.use(authMiddleware)                    // Solo autenticado
router.use(authMiddleware, requireRole('admin'))  // Solo administradores
router.use(authMiddleware, requireRole('lawyer', 'admin')) // Lawyer o admin
```

## 🔒 Cifrado

```typescript
import { encryptData, decryptData } from '@utils/encryption'

// Cifrar datos sensibles
const encrypted = encryptData('sensitive data')

// Descifrar
const decrypted = decryptData(encrypted)
```

## 📚 Endpoints API

### Autenticación (`/auth`)
- `POST /login` - Login de usuario
- `POST /register` - Registro nuevo
- `POST /logout` - Logout

### Citas (`/appointments`)
- `GET /` - Listar citas
- `POST /` - Crear cita
- `PUT /:id` - Actualizar cita
- `DELETE /:id` - Eliminar cita

### Pagos (`/payments`)
- `GET /` - Listar pagos
- `POST /` - Registrar pago
- `PUT /:id` - Actualizar estado

## 🔧 Variables de Entorno

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=password
DB_NAME=bufete_abogados

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Encryption
ENCRYPTION_KEY=your_32_char_key

# APIs Externas
PAYPHONE_API_KEY=...
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
ANTHROPIC_API_KEY=...
```

## 🚀 Deployment

1. Build:
   ```bash
   npm run build
   ```

2. Iniciar:
   ```bash
   npm start
   ```

3. Con variables de entorno de producción

## 📝 Notas

- HTTPS/TLS 1.3 recomendado en producción
- Rate limiting habilitado
- CORS configurado para frontend
- Logs en stdout para debugging
