# Contasist - Sistema de Gestión de Cotizaciones

Es una aplicación web de gestión administrativa y contable ligera diseñada para que pequeñas y medianas empresas organicen sus clientes, usuarios y servicios, y generen cotizaciones profesionales de forma rápida y ordenada. La plataforma centraliza la información del negocio, automatiza el cálculo de precios e impuestos básicos, controla el ciclo de vida de las cotizaciones y permite exportarlas en formatos listos para enviar al cliente, sirviendo como un punto de partida sólido para la futura gestión de facturación, ingresos y contabilidad, sin la complejidad de un sistema contable completo desde el primer día.
## 🚀 Características

- **Autenticación**: Sistema seguro de login y rutas protegidas
- **Gestión de Clientes**: Crear, editar y eliminar información de clientes
- **Proveedores**: Administración completa de proveedores de bienes y servicios
- **Catálogo de Productos**: Administración completa del inventario de productos
- **Compras y Gastos**: Gestión de cuentas por pagar, egresos y control de pagos
- **Cotizaciones**: Crear y gestionar cotizaciones con cálculos automáticos
- **Dashboard**: Panel de control con estadísticas e información reciente
- **Exportación PDF**: Generar cotizaciones y documentos en formato PDF
- **Interfaz Responsiva**: Diseño adaptable a cualquier dispositivo
- **Notificaciones**: Sistema de notificaciones con Sonner

## 🛠️ Tecnologías

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS + PostCSS
- **UI Components**: Componentes personalizados + shadcn/ui
- **Gestión de Estado**: React Hooks + React Query (@tanstack/react-query)
- **Validación de Formularios**: Zod + React Hook Form
- **Notificaciones**: Sonner
- **Herramientas**: ESLint para code quality

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes estructurales (Atomic Design)
│   ├── atoms/        # Base UI (botones, inputs, badges)
│   ├── molecules/    # Agrupaciones simples (forms, cards, dialogs)
│   └── organisms/    # Componentes complejos (listas y formularios por dominio)
├── entities/         # Definiciones de interfaces (Domain Entities)
├── hooks/            # Hooks de utilidad general e infraestructura
├── lib/              # Utilidades, helpers y configuración de UI
├── pages/            # Vistas principales de la aplicación
├── templates/        # Layouts y estructuras de página base
└── useCases/         # Lógica de negocio y persistencia (React Query Facades)
```

## 🚀 Inicio Rápido

### Requisitos previos
- Node.js 18+ 
- npm / pnpm

### Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Vista previa de build
pnpm preview
```

## 📝 Scripts Disponibles

- `pnpm dev` - Inicia servidor de desarrollo con HMR
- `pnpm build` - Compila la aplicación para producción
- `pnpm preview` - Vista previa del build
- `pnpm lint` - Ejecuta ESLint para verificar código

## 🔐 Autenticación

El sistema incluye rutas protegidas que requieren autenticación previa. Los usuarios sin sesión activa serán redirigidos a la página de login.

## 📊 Módulos Principales

- **Dashboard**: Resumen de información y estadísticas clave.
- **Clientes**: Gestión completa de base de datos de clientes.
- **Catálogo**: Administración del inventario de productos y servicios.
- **Proveedores**: Registro y administración de proveedores (Compras).
- **Gastos**: Control de egresos, categorías de gastos y cuentas por pagar.
- **Cotizaciones**: Creación, seguimiento y exportación de presupuestos.
- **Configuración**: Ajustes de usuario, perfil empresarial y personalización.

## 🏗️ Principios de Desarrollo

- **Atomic Design**: Organización de componentes por nivel de complejidad (Atoms -> Molecules -> Organisms).
- **Clean Architecture**: Separación clara entre entidades de dominio, lógica de aplicación (Use Cases) e infraestructura (Hooks/Servicios).
- **SOLID**: Implementación de código mantenible, extensible y con responsabilidades únicas.
- **Legibilidad**: El código prioriza la claridad y la documentación sobre la brevedad.

## 🎨 Sistema de Diseño

### Paleta de Colores
Colores definidos en `src/index.css` (HSL) para facilitar el soporte de temas (Light/Dark).

| Variable | Descripción |
| :--- | :--- |
| **Primary** | Color principal de marca, botones primarios y estados activos. |
| **Secondary** | Elementos secundarios. |
| **Background** | Fondo general de la página. |
| **Foreground** | Color de texto principal. |
| **Card** | Fondo de los componentes tipo tarjeta. |
| **Muted** | Fondos atenuados (ej. encabezados de tabla, breadcrumbs). |
| **Accent** | Elementos destacados y estados hover. |
| **Destructive**| Indicadores de error y acciones destructivas (ej. eliminar). |
| **Border** | Color para bordes y separadores. |

### Tipografía

| Tipo | Fuente (Font Family) | Propósito |
| :--- | :--- | :--- |
| **Primaria (Sans)** | **Lato** | Texto general, cuerpo, títulos y elementos de interfaz. Configurada como la fuente `sans` por defecto. |
| **Secundaria** | **Rubik** | Fuente complementaria para elementos decorativos o destacados. Utilizar con `font-secondary`. |
| **Serif** | **Lora** | Texto elegante o editorial. |
| **Mono** | **Inconsolata** | Código, identificadores, precios y datos numéricos tabulares. |

## 📄 Licencia

Este proyecto está desarrollado para uso comercial.
