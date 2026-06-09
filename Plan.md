# Plano: Suporte e Manutenção

## Modelo de Negócio
Aluguel por missão → drone precisa estar operacional. Surge a necessidade de:
- Rastrear desgaste de peças por horas de voo
- Agendar revisões preventivas
- Registrar chamados de suporte

## Status do Drone

Cada build (DroneConfig) tem um campo `status` que controla visibilidade e contabilidade na frota:

| Status | Na frota? | Conta nos totais? | Comportamento |
|--------|-----------|-------------------|---------------|
| `operacional` | ✅ Sim | ✅ Sim | Padrão, visível normalmente na frota |
| `em_revisao` | ❌ Não (perde frota autom.) | ❌ Não | Seção "Em Revisão" no Dashboard |
| `inativo` | ✅ Pode ficar | ❌ Não | Card muted, não soma stats |

### Regras
- `setBuildStatus(buildId, 'em_revisao')` → `fleetId` setado para `null` automaticamente (remove da frota)
- `setBuildStatus(buildId, 'inativo')` → `fleetId` preservado, mas drone não entra nos cálculos de valor total, custo médio, diária, nem contagem de componentes
- Stats do Dashboard (Valor da Frota, Custo Médio, Componentes) consideram apenas `operacional`

## Estrutura sugerida

### 1. Client-side (implementação imediata) ✅

#### Store (`droneStore.js`)
- Adicionar ação `setBuildStatus(buildId, status)`:
  - Se `em_revisao` → setar `fleetId: null`
  - Se `inativo` → preservar `fleetId`
  - Qualquer status → persistir no build e no servidor (se JWT presente)

#### Dashboard (`Dashboard.jsx`)
- Cards com status badge (`🟢 Operacional` / `🟡 Em Revisão` / `⚪ Inativo`) e ações para alterar status
- Seções reorganizadas:
  1. **Frotas** — só drones `operacional` + `inativo` (inativo com estilo muted)
  2. **Em Revisão** — todos `em_revisao` (sempre sem frota)
  3. **Sem Frota** — só `operacional` sem frota
- Stats calculados apenas com drones `operacional`

### 2. Modelo `MaintenanceLog` (servidor — futura etapa)
```
DroneConfig + usuário
  ├── horasVoo: Number (acumulado)
  ├── ultimaRevisao: Date
  ├── proximaRevisao: Date
  ├── pecasTrocadas: [{ peca, data, motivo }]
  └── status: 'operacional' | 'em_revisao' | 'inativo'
```

### 3. Modelo `SupportTicket` (servidor — futura etapa)
```
usuário + DroneConfig (opcional)
  ├── titulo, descricao
  ├── prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  ├── status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
  └── mensagens: [{ autor, texto, createdAt }]
```

### 4. Página de Suporte (`/support` — futura)
- Listar tickets do usuário
- Abrir novo ticket (vincular a uma config de drone ou avulso)
- Histórico de respostas

### 5. Página de Manutenção (`/maintenance` — futura)
- Visão geral: status de cada drone da frota
- Próximas revisões agendadas
- Histórico de peças trocadas

### 6. Webhook (futuro)
- Notificação por e-mail quando revisão estiver próxima
- Notificação de resposta a ticket

## Como encaixa no fluxo atual

```
Catálogo / Configurador
       ↓
  Adicionar ao Carrinho ←─── (com ou sem frota)
       ↓
  Página /cart
    ├── Escolher plano (mensal / anual)
    ├── Definir frota por item
    └── Confirmar assinatura
       ↓
  Dashboard (frota)
       ↓
  Operacional
       ↓
  ┌────────────┼────────────┐
  ↓            ↓            ↓
em_revisao  inativo    operacional
(sem frota) (na frota,  (na frota,
            não soma)   contabilizado)
                ↓
        (futuro: registrar
         horas de voo →
         sugerir revisão)
```

## Carrinho e Planos de Assinatura

### Visão geral
O carrinho substitui o antigo fluxo de "Reservar". Em vez de reservar um drone para uma missão específica, o usuário monta um carrinho com drones e assina um plano de uso mensal ou anual. Os drones podem ser atribuídos a uma frota no momento da finalização ou ficar sem frota para organização posterior.

### Fluxo do carrinho

```
Catálogo / Configurador
       ↓
  "Adicionar ao Carrinho" (com ou sem frota)
       ↓
  Página /cart
    ├── Lista de itens (drone + plano escolhido)
    ├── Seletor de plano: Mensal vs Anual
    ├── Resumo de valores
    └── Confirmar assinatura
       ↓
  Itens vão para Dashboard (frota ou sem frota)
  Assinatura ativa passa a valer
```

### Tela de Carrinho (`/cart`)

- **Lista de itens:** cada drone adicionado com nome, missão, valor total e diária calculada
- **Seletor de frota por item:** dropdown para escolher frota existente ou "Sem Frota"
- **Seletor de plano global:**
  - **Mensal:** `diária × 30` por drone
  - **Anual:** `mensal × 12` com desconto (ex: 15% off)
- **Resumo financeiro:**
  - Valor total dos drones
  - Plano escolhido (mensal ou anual)
  - Subtotal do plano
  - Taxa de suporte/manutenção (se aplicável — ver abaixo)
  - **Total a pagar**
- **Botão "Confirmar Assinatura"** → itens vão para o Dashboard com status `operacional`

### Regras de Suporte e Manutenção

| Condição | Suporte | Manutenção/Revisão |
|----------|---------|-------------------|
| **20+ drones ativos** | ✅ Incluso no plano | ✅ Incluso no plano |
| **10 a 19 drones ativos** | ⬜ Cobrado à parte (ex: $X/mês fixo ou % do plano) | ⬜ 50% do valor da manutenção |
| **< 10 drones ativos** | ⬜ Cobrado à parte (ex: $X/mês fixo ou % do plano) | ⬜ 100% do valor da manutenção |

- A contagem de "drones ativos" considera todos os builds com status `operacional` do usuário
- Quando o usuário atinge 20+ drones, suporte e manutenção são incluídos sem custo extra
- Entre 10 e 19 drones, a manutenção/revisão tem 50% de desconto sobre o valor base
- Abaixo de 10 drones, manutenção/revisão é cobrada integralmente

### Store (`droneStore.js`)

- `cart: []` — array de `{ build, fleetId, planType }`
- `addToCart(build, fleetId?)` — adiciona ao carrinho
- `removeFromCart(buildId)` — remove do carrinho
- `setCartItemFleet(buildId, fleetId)` — altera frota de um item no carrinho
- `setPlanType('mensal' | 'anual')` — plano global
- `clearCart()` — limpa após confirmação
- `confirmCart()` — move itens para `savedBuilds` com status `operacional`, persiste no servidor, limpa carrinho

### Endpoints (futuro — servidor)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/api/subscription/confirm` | Confirmar assinatura do carrinho | ✅ |

O modelo de assinatura no servidor pode ser introduzido posteriormente. Inicialmente, o carrinho funciona 100% no client (Zustand + localStorage), igual ao resto do sistema.

## Prioridade
1. ✅ **Status no client** — `setBuildStatus`, Dashboard com seções e badges (atual)
2. ⬜ Modelos `MaintenanceLog` + `SupportTicket` no servidor
3. ⬜ Página de Suporte (`/support`)
4. ⬜ Página de Manutenção (`/maintenance`)
5. ⬜ Webhooks de notificação
