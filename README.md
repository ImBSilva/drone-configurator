# Drone Configurator

Configurador industrial de drones — projeto full-stack de estudos.
Monte drones 3D, organize frotas, gerencie assinaturas e alugue por missão.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| **3D** | React Three Fiber, Drei, Three.js |
| **Estado** | Zustand |
| **Ícones** | Lucide React |
| **HTTP** | Axios |
| **Backend** | Node.js 22, Fastify 5 |
| **Banco** | MongoDB + Mongoose 8 |
| **Auth** | JWT, bcryptjs |

## Funcionalidades

- Configurador 3D com React Three Fiber
- Catálogo de drones
- Sistema de frotas
- Carrinho com planos mensal/anual
- Autenticação e perfil de operador
- API segura com sanitização NoSQL/XSS

## Design System

O design system foi criado no **Figma** e documentado em `reference/`. Segue um estilo tech/industrial com tema escuro como padrão e suporte a tema claro.

**Tokens disponíveis:**
- **Cores** — OKLch com variáveis CSS para `--bg`, `--surface`, `--fg`, `--accent`, `--success`, `--warning`, `--danger`
- **Tipografia** — Inter (sans-serif) + JetBrains Mono (dados e código)
- **Espaçamento** — Sistema de 8px (`--space-xs` a `--space-2xl`)
- **Componentes** — Botões, inputs, badges, cards, tabelas, navegação, preços

**Implementação no projeto:**
Os tokens do design system foram adaptados para o Tailwind CSS 4 via `@theme` no `index.css`. O layout e os componentes do React seguem os patterns definidos no Figma.

> 📖 Spec completo dos componentes e variáveis Figma em [`reference/component-spec.html`](reference/component-spec.html).

## Arquitetura 3D

O visualizador 3D usa **React Three Fiber v9** com **Drei v10** e **Three.js 0.184**.

### Migração para .glb (em planejamento)

O próximo passo é migrar para modelos `.glb` criados no **Blender**, permitindo variação visual real entre modelos.

**Estrutura de arquivos planejada:**
```
client/public/
├── frames/           # Estrutura base do drone (6 modelos)
│   ├── drone-carbon.glb
│   ├── drone-nano.glb
│   └── ...
└── parts/            # Peças avulsas modulares
    ├── motor.glb
    ├── prop-5.glb, prop-7.glb
    ├── battery-4s.glb, battery-6s.glb
    └── camera-4k.glb, camera-thermal.glb, ...
```

**Como adicionar novos modelos 3D otimizados:**

1. **Modelar o frame no Blender** com a hierarquia padronizada:
   - Nomear materiais como `Material_Frame`, `Material_Accent`, `Material_Motor`, etc.
   - Incluir **Empties** de encaixe com nomes fixos: `attach_motor_FR`, `attach_battery`, `attach_camera`, `pivot_prop_FR`, etc.
   - Fazer UV unwrap nas meshes que receberão textura customizada

2. **Exportar como `.glb`** com texturas embutidas para `client/public/frames/`

3. **Criar as partes** (motor, bateria, câmera, hélices) separadamente e exportar para `client/public/parts/`

4. **No código**, o componente `DroneModelGLTF.jsx` lê a posição dos Empties e instancia as peças automaticamente usando `useGLTF` do Drei. Cores dinâmicas são aplicadas via `material.color.set()` nos materiais nomeados.

> 📖 Detalhes completos da arquitetura 3D em [`3d-architecture.md`](3d-architecture.md).

## Pré-requisitos

- Docker (para MongoDB)
- Node.js 22+
- npm

## Rodar localmente

```bash
# 1. Subir MongoDB
docker compose up -d mongodb

# 2. Backend
cd server
cp .env.example .env
npm install
npm run dev

# 3. Frontend (outro terminal)
cd client
cp .env.example .env
npm install
npm run dev
```

## CI/CD

O projeto usa **GitHub Actions** para integração contínua. O workflow está em `.github/workflows/ci.yml` e roda automaticamente em todo `push` ou `pull_request` para a branch `main`.

**Jobs:**
- **client** — `npm ci` → `npm run lint` → `npm run build`
- **server** — `npm ci` (verifica instalação das dependências)

## Próximos passos

- Integração ArcGIS — mapas e geolocalização para missões
- Fluxo de suporte — tickets, prioridades, histórico
- Modelo de manutenção — rastrear horas de voo, peças trocadas, revisões
- Webhooks — notificações de revisão e resposta a tickets

## Licença

ISC
