# AuraStyle / SharkZone

Marketplace de moda con catálogo, carrito, checkout, panel de administración y panel de vendedores.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** + shadcn/ui (Radix)
- **Firebase** (Auth + Firestore) y **Cloudinary** para imágenes
- **Wompi** para pagos

## Requisitos

- Node.js 22+
- Una cuenta/proyecto de Firebase
- Un cloud de Cloudinary con upload preset sin firmar

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Todas las variables están documentadas en `.env.example`. El cliente de Firebase falla
al arrancar si falta alguna, para evitar errores silenciosos.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint (flat config) |
| `npm run lint:fix` | ESLint con autofix |
| `npm run typecheck` | TypeScript sin emitir |

## Estructura

```
src/
├─ app/                     # Solo rutas (App Router)
│  ├─ page.tsx              # Home
│  ├─ login/                # Iniciar sesión
│  ├─ registro/             # Crear cuenta
│  ├─ products/[id]/        # Detalle de producto
│  ├─ checkout/             # Checkout + Wompi
│  ├─ pedido/               # Confirmación de pedido
│  ├─ socios/               # Solicitud de socio
│  ├─ admin/                # Panel de administración
│  ├─ vendedor/             # Panel de vendedor
│  ├─ error.tsx             # Error boundary global
│  ├─ not-found.tsx         # 404
│  └─ loading.tsx           # Estado de carga global
├─ components/
│  ├─ ui/                   # shadcn/ui
│  ├─ layout/               # Header, Footer, carrito
│  ├─ product/              # Grid, slider, reseñas
│  └─ sections/             # Banner, manifiesto, contacto
├─ features/
│  ├─ admin/                # AdminPanel y subpaneles
│  ├─ auth/                 # useAuth, RegisterForm
│  └─ cart/                 # CartContext
├─ lib/
│  ├─ firebase/client.ts    # Inicialización de Firebase
│  ├─ firebase/products.ts  # Lectura de productos
│  ├─ firebase/admin-*.ts   # Escrituras de administración
│  ├─ cloudinary.ts         # Subida de imágenes
│  ├─ format.ts             # Precios, descuentos
│  └─ product-image.ts      # Normalización de imágenes
├─ config/constants.ts      # Correos admin
└─ types/                   # Product, User
```

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Home con slider y catálogo |
| `/products/[id]` | Detalle de producto y reseñas |
| `/checkout` | Checkout y pago con Wompi |
| `/pedido?orderId=...` | Confirmación de pedido |
| `/login` · `/registro` | Autenticación |
| `/admin` | Panel de administración |
| `/vendedor` | Panel de vendedor |
| `/socios` | Solicitud para ser socio |

Las rutas antiguas `/inicio`, `/vendedor-dashboard` y `/order-confirmation` redirigen
automáticamente a las nuevas.

## Administración

Para marcar un usuario como admin con custom claims:

```bash
node scripts/set-admin.mjs <UID>
```

Requiere `serviceAccountKey.json` en la raíz (ignorado por git).

## Pendiente (Fase 2)

- Firestore Rules + `middleware.ts` para proteger `/admin` y `/vendedor` en el servidor.
- Cloud Functions para crear pedidos, descontar stock y calcular comisiones en transacciones.
- Catálogo y detalle de producto con Server Components y metadata real (SEO).
- Tests (Vitest + Testing Library) y CI.
