# Portal Web Profesional para Bufete de Abogados

Plataforma web moderna y segura para gestionar servicios legales, agendamiento de citas, pagos en línea, y más.

## 🚀 Características Principales

- **Agendamiento Inteligente**: Sistema de citas con sincronización a Google Calendar
- **Pagos en Línea**: Integración con Payphone para cobro seguro
- **Blog Jurídico**: Artículos optimizados para SEO
- **Perfiles de Abogados**: Showcases profesionales
- **Panel Administrativo**: Dashboard con reportes y estadísticas
- **IA Integrada**: Asistente virtual con Claude API
- **Notificaciones**: Email (SendGrid) y WhatsApp (Twilio)
- **Seguridad Empresarial**: Cifrado AES-256, JWT, bcrypt

## 🛠️ Tech Stack

### Frontend
- React 18+ con TypeScript
- Vite como build tool
- Zustand para state management
- Axios para HTTP requests

### Backend
- Node.js + Express con TypeScript
- SQL Server como base de datos
- JWT para autenticación
- Integración con APIs externas

### Integraciones
- Payphone (Pagos)
- SendGrid (Email)
- Twilio (WhatsApp)
- Google Calendar
- Claude AI (Antropic)

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- SQL Server (instalado y funcionando)
- Claves API de servicios externos

## 🚀 Instalación y Ejecución

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Accede a http://localhost:5173

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales
npm run dev
```

El servidor estará en http://localhost:3000

### Database

```bash
cd database
# Ejecuta los scripts SQL Server en este orden:
# 1. 01-schema.sql
# 2. 02-tables.sql
# 3. 03-procedures.sql
```

## 📁 Estructura del Proyecto

```
abogados/
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Servicios HTTP
│   │   ├── hooks/             # Custom hooks
│   │   ├── types/             # Tipos TypeScript
│   │   ├── utils/             # Utilidades
│   │   └── styles/            # Estilos globales
│   └── public/                # Assets estáticos
├── backend/
│   ├── src/
│   │   ├── routes/            # Rutas de API
│   │   ├── controllers/       # Controladores
│   │   ├── services/          # Lógica de negocio
│   │   ├── middleware/        # Middleware personalizado
│   │   ├── config/            # Configuraciones
│   │   ├── utils/             # Utilidades
│   │   ├── models/            # Modelos de datos
│   │   └── types/             # Tipos TypeScript
│   └── src/server.ts          # Punto de entrada
└── database/
    ├── 01-schema.sql          # Esquema base
    ├── 02-tables.sql          # Tablas principales
    └── 03-procedures.sql      # Procedimientos almacenados
```

## 🔒 Seguridad

### Implementado
- Autenticación JWT
- Cifrado AES-256 para datos sensibles
- Bcrypt para contraseñas
- HTTPS/TLS 1.3
- Rate limiting
- CORS configurado
- Validación de entrada

### Variables Sensibles
Todas las claves API y credenciales van en archivos `.env`

## 📚 Documentación

- [Frontend Architecture](./frontend/README.md)
- [Backend API Documentation](./backend/README.md)
- [Database Schema](./database/SCHEMA.md)

## 🤝 Contribución

Sigue el estándar de commits y pull requests documentado.

## 📄 Licencia

Todos los derechos reservados © 2024

## 📞 Soporte

Para consultas de desarrollo, contacta al equipo de RV Desarrolladora de Software.
