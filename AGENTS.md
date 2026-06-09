# Drone — Industrial Drone Configurator

## Repo structure

```
client/       # React 19 + Vite 8 + Tailwind 4 + R3F (JSX, not TSX)
server/       # Fastify 5 + Mongoose 8 (ESM, "type": "module")
reference/   # Design system (Figma → HTML/CSS spec) — NOT part of the app; do not edit
docker-compose.yml  # MongoDB 7 + server
```

No test framework or test files exist.
Only `client/` has a `.gitignore` — root and `server/` have theirs.

## Commands

```powershell
# Server (run first — requires MongoDB)
cd server
cp .env.example .env     # 1st time only
npm install
npm run dev              # node --watch (no nodemon needed)

# Client (separate terminal)
cd client
cp .env.example .env     # 1st time only
npm install
npm run dev              # Vite dev server on :5173
npm run lint             # ESLint only (client), run from client/
npm run build            # Vite production build
npm run preview          # Preview production build locally

# Docker (MongoDB only, recommended)
docker compose up -d mongodb

# Full stack via Docker
docker compose up -d     # MongoDB + server; client still needs npm run dev

docker compose down      # Stop everything
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| **3D** | React Three Fiber 9, Drei 10, Three.js 0.184 |
| **Estado** | Zustand 5 |
| **Ícones** | Lucide React |
| **HTTP** | Axios |
| **Backend** | Node.js 22, Fastify 5 |
| **Banco** | MongoDB + Mongoose 8 |
| **Auth** | JWT (`@fastify/jwt`), bcryptjs |
| **Segurança** | Sanitização NoSQL/XSS, BOLA/IDOR mitigation |

## Architecture

- **Entrypoints:** `client/src/main.jsx` → `App.jsx` (BrowserRouter — not createBrowserRouter), `server/src/server.js` (Fastify)
- **Routes (client):** `/`, `/catalog`, `/configurator`, `/dashboard` (protected), `/profile` (protected), `/login`, `/register`, `*` → redirect to `/`
- **Auth:** JWT in `localStorage` key `drone-auth-token`. Use `ProtectedRoute` wrapper (checks token, redirects to `/login`) for new authenticated pages. Server `authenticate` middleware + ownership check on every drone CRUD (BOLA/IDOR mitigation).
- **State:** Zustand 5 store at `client/src/store/droneStore.js` — persists to localStorage keys `drone-builds`, `drone-fleets`, `drone-session`; syncs with API when JWT present.
- **Rental model:** Builds have `missionType` (vigilancia/agricultura/mapeamento/seguranca/industrial/outro), `dailyRate` (8% of total cost) and `status` (`operacional` | `em_revisao` | `inativo`). Status controls fleet visibility and stats inclusion.
- **API calls:** Always import from `client/src/services/api.js` (Axios instance with JWT interceptor). Never call Axios directly with tokens.
- **Security:** Recursive NoSQL/XSS sanitize middleware (`server/src/middlewares/sanitize.js`) on all route body/query/params. Error handlers never leak stack traces. Uniform auth failure messages (no user enumeration). bcrypt with 12 salt rounds.
- **Tailwind 4** via `@tailwindcss/vite` plugin — no postcss config file needed. Custom dark theme defined in `index.css` `@theme` block.
- **ESLint:** Flat config at `client/eslint.config.js` (uses `@eslint/js`, `react-hooks`, `react-refresh`). Run from `client/` with `npm run lint`.
- **UI language:** Portuguese (server error messages, client UI). Keep consistent.

## Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `GET` | `/health` | Health check | ❌ |
| `POST` | `/api/auth/register` | Registrar novo operador | ❌ |
| `POST` | `/api/auth/login` | Login (retorna JWT) | ❌ |
| `GET` | `/api/auth/me` | Dados do usuário logado | ✅ |
| `PUT` | `/api/auth/profile` | Atualizar nome/org/role | ✅ |
| `PUT` | `/api/auth/password` | Alterar senha | ✅ |
| `GET` | `/api/drones` | Listar configurações da frota | ✅ |
| `POST` | `/api/drones` | Criar nova configuração | ✅ |
| `GET` | `/api/drones/:id` | Buscar config por ID | ✅ |
| `PUT` | `/api/drones/:id` | Atualizar configuração | ✅ |
| `DELETE` | `/api/drones/:id` | Remover configuração | ✅ |

## Environment Variables

### server/.env
```
PORT=5000
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/drone_configurator
JWT_SECRET=sua_chave_secreta_jwt
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
```

### client/.env
```
VITE_API_URL=http://localhost:5000
```

## Deploy

### MongoDB Atlas (banco gratuito)
Render não tem banco. Use MongoDB Atlas cluster **M0 (Free)**:
1. Criar user/senha em **Database Access**
2. Liberar `0.0.0.0/0` em **Network Access**
3. Conectar → Drivers → copiar `mongodb+srv://...`

### Render (Backend)
| Campo | Valor |
|-------|-------|
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |

### Vercel (Frontend)
| Campo | Valor |
|-------|-------|
| **Root Directory** | `client` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

> ⚠️ Render Free "dorme" após 15 min — primeira requisição leva ~30s.

## Gotchas

- Server uses ESM (`"type": "module"`). Always use `import`/`export`, never `require`.
- Client is JSX (`.jsx`), not TSX — `@types/*` in devDeps are for editor hints only.
- Server dev mode uses built-in `node --watch` — not nodemon, not tsx.
- `Site_Alpha/` is a **design reference only**. Never import, link, or modify it.
- Docker image uses `npm ci --omit=dev` — keep `package-lock.json` in sync.
- Server has a hardcoded JWT_SECRET fallback in `server.js` — override via `.env` for production.
- Server `setErrorHandler` (server.js:61) leaks `error.validation` on schema validation errors — **not** a security leak (Fastify schema field names), but be aware.
- `autoprefixer` and `postcss` in client devDeps are vestigial (Tailwind 4 handles prefixing natively).
