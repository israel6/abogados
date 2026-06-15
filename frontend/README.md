# Frontend - Portal Bufete de Abogados

React + TypeScript frontend para el portal web del bufete de abogados.

## 🚀 Características

- **Responsive Design**: Mobile-first, compatible con todos los dispositivos
- **Componentes Reutilizables**: Estructura modular y escalable
- **State Management**: Zustand para gestión de estado
- **HTTP Client**: Axios con interceptores
- **Routing**: React Router v6
- **TypeScript**: Type safety completo

## 📦 Instalación

```bash
npm install
```

## 🏗️ Estructura

```
src/
├── components/        # Componentes reutilizables
├── pages/            # Páginas de la aplicación
├── services/         # Servicios HTTP y API
├── hooks/            # Custom hooks
├── types/            # Tipos TypeScript
├── utils/            # Funciones utilitarias
├── styles/           # Estilos globales
└── App.tsx           # Componente raíz
```

## 🛠️ Scripts

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🔗 API Integration

Las llamadas API se hacen a través de `VITE_API_URL`:
```typescript
// En .env
VITE_API_URL=http://localhost:3000
```

## 📋 Páginas Principales

- **Home** - Landing page con información del bufete
- **Appointments** - Sistema de agendamiento
- **Blog** - Blog jurídico
- **Lawyers** - Perfiles de abogados
- **Login/Register** - Autenticación
- **Dashboard** - Panel para clientes y administradores

## 🔒 Seguridad

- JWT tokens en localStorage
- Validación de formularios
- Protección contra XSS
- CORS configurado en backend

## 📚 Componentes Principales

### Layout
- `Header` - Navegación superior
- `Sidebar` - Menú lateral
- `Footer` - Pie de página

### Authentication
- `LoginForm` - Formulario de login
- `RegisterForm` - Formulario de registro
- `ProtectedRoute` - Wrapper para rutas protegidas

### Features
- `AppointmentList` - Lista de citas
- `AppointmentForm` - Formulario de agendamiento
- `PaymentForm` - Formulario de pago
- `ArticleList` - Lista de artículos del blog

## 🚀 Deployment

1. Build para producción:
   ```bash
   npm run build
   ```

2. Archivos en `dist/` listos para servir

## 📝 Notas

- Variables de entorno en `.env`
- Usar path aliases con `@` para imports
- TypeScript strict mode habilitado
