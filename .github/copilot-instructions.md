# Portal Web Profesional para Bufete de Abogados

## Descripción del Proyecto
Portal web completo para un bufete de abogados con:
- Agendamiento de citas inteligente
- Pagos en línea seguros (Payphone)
- Blog jurídico optimizado para SEO
- Perfiles profesionales de abogados
- Testimonios y casos de éxito
- Panel de control y reportes
- Notificaciones automáticas (email, WhatsApp)
- IA integrada (Claude API)
- Cifrado y seguridad empresarial

## Stack Tecnológico
- **Frontend**: React.js + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQL Server
- **Integraciones**: Payphone, SendGrid, Twilio, Google Calendar, Claude AI
- **Seguridad**: AES-256, TLS 1.3, JWT, bcrypt

## Estructura del Proyecto
```
abogados/
├── frontend/          # React TypeScript application
├── backend/           # Node.js Express server
├── database/          # SQL Server scripts
└── .github/          # Configuration files
```

## Checklist de Desarrollo

- [x] **Scaffold del Frontend** - Crear estructura React + TypeScript
- [x] **Scaffold del Backend** - Crear estructura Node.js + Express
- [x] **Configuración de Base de Datos** - Scripts SQL Server
- [x] **Autenticación JWT** - Login, registro, perfil con rol en token
- [x] **Control de acceso por roles** - Middleware `requireRole` + rutas admin protegidas
- [x] **Módulo de Citas** - Agendamiento con carga dinámica de abogados y notificaciones reales
- [x] **Módulo de Pagos** - Integración Payphone Button API con webhook HMAC
- [x] **Módulo de Blog** - Artículos jurídicos con paginación y categorías
- [x] **Perfiles de Abogados** - Gestión de profesionales (schema corregido)
- [x] **Panel Administrativo** - Dashboard y reportes (protegido por rol admin)
- [x] **IA y Chatbot** - Integración Claude API con historial en BD
- [x] **Notificaciones** - Email (SendGrid) y WhatsApp (Twilio) con datos reales
- [x] **Cifrado y Seguridad** - AES-256, JWT, bcrypt
- [ ] **Google Calendar** - Sincronización de citas (pendiente)
- [ ] **Testing** - Unit tests e integración (pendiente)
- [ ] **Despliegue** - Configuración de producción (pendiente)

## Instrucciones de Desarrollo

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Notas de Seguridad
- Todas las variables sensibles en archivos .env
- Código ofuscado en producción
- Cifrado AES-256 para datos sensibles
- Autenticación JWT con tokens seguros
- Conexión HTTPS/TLS 1.3
