# AGENT.md — Politiqui

> Este arquivo é a fonte da verdade para qualquer agente de IA ou desenvolvedor trabalhando neste projeto.
> **Nunca assuma, invente ou extrapole** informações que não estejam documentadas aqui.
> Se algo não estiver descrito, pergunte antes de implementar.

---

## 1. Visão Geral do Projeto

**Nome:** Politiqui  
**Descrição:** Sistema de captação de eleitores para campanhas políticas.  
**Estágio atual:** Frontend em React com dados mockados via `localStorage` (sem backend real ainda).  
**Plataforma:** Web (React PWA) — futura versão mobile (a definir).

---

## 2. Stack Tecnológica

### Frontend (implementado)
- **Framework:** React 18 + Vite 6
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Componentes UI:** `src/app/components/ui/` (gerados pelo shadcn)
- **Ícones:** Lucide React
- **Roteamento:** Sem router — navegação por estado (`activeTab`, `selectedElector`)
- **Estado global:** `useState` em `App.tsx` (Context/Zustand não usados ainda)
- **Notificações:** Sonner (`toast.success`, `toast.info`, `toast.error`)
- **Gráficos:** Recharts 2.15.2
- **QR Code (geração):** `qrcode.react` → `QRCodeSVG`
- **QR Code (leitura):** `html5-qrcode` → `Html5Qrcode`
- **Persistência:** `localStorage` (chaves: `politiqui_user`, `politiqui_electors`)
- **Pacotes:** pnpm workspace (mas usar `npm` no terminal — pnpm não disponível no ambiente)
- **Dev server:** `npm run dev`

### Backend (planejado — ainda não implementado)
- **Plataforma:** Supabase
- **Banco de dados:** PostgreSQL (via Supabase)
- **Autenticação:** Supabase Auth (JWT com roles no `user_metadata`)
- **API:** REST gerada automaticamente pelo Supabase
- **Controle de acesso:** Row Level Security (RLS) no PostgreSQL

### Infraestrutura / Deploy
- **Build:** Docker (multi-stage)
- **Servidor de arquivos estáticos:** `serve` (node:20-alpine)
- **Variáveis de ambiente:** `VITE_API_BASE_URL` injetada via `ARG` no build
- **Timezone:** `America/Sao_Paulo`
- **Porta exposta:** `3000`
- **Entrypoint:** `/app/entrypoint.sh`

---

## 3. Padrão de Cores (obrigatório)

> **Cor padrão do app: AZUL (`blue-600` / `blue-700`)**
> Nunca usar roxo (`purple`) ou vermelho (`red`) como cor de interface principal.

### Regras de cor
| Contexto | Classe |
|---|---|
| Header / gradiente principal | `bg-gradient-to-r from-blue-600 to-blue-700` |
| Botão primário | `bg-blue-600 hover:bg-blue-700` |
| Texto de destaque | `text-blue-600` / `text-blue-700` |
| Fundo suave (card, hover) | `bg-blue-50` / `bg-blue-100` |
| Borda de destaque | `border-blue-200` |
| Subtítulo / subtext | `text-blue-100` (sobre fundo azul escuro) |

### Exceções permitidas (UX semântica)
| Situação | Cor | Justificativa |
|---|---|---|
| Badge papel "Liderança" | `red` | Distinção visual de papel de alto nível |
| Hover botão Excluir / Trash | `hover:text-red-600 hover:bg-red-50` | Ação destrutiva — sinalização de perigo |
| Badge papel "Coord. Geral" | `purple` | Distinção visual de papel |
| Estado de erro / `toast.error` | `red` | Feedback negativo padrão |
| Estado de sucesso / `toast.success` | `green` | Feedback positivo padrão |

---

## 4. Arquitetura de Dados

### Entidades principais

```
Deputado
  └── Coordenador Geral (1 por deputado)
        └── Coordenador Regional (N por coord. geral)
              └── Captador de Votos (N por coord. regional)
                    └── Eleitor (N por captador)

Enquete
  └── Pergunta (N por enquete)
        └── Resposta (N por pergunta)

Atividade (agenda)
  └── Vinculada a: Eleitor + Usuário responsável
```

### Interface `ElectorData` (implementada em CaptureForm.tsx)
```ts
interface ElectorData {
  id: string
  nome: string
  telefone?: string
  email?: string
  endereco?: string
  cpf?: string
  dataNascimento?: string
  nivelVoto?: 'certo' | 'provável' | 'incerto'
  nicho?: string
  tituloEleitor?: string   // 12 dígitos, validado no form
  createdAt: string
  createdBy?: string       // userId do captador
  createdByName?: string   // nome exibível do captador
  regiao?: string          // copiado do user.regiao no momento do cadastro
}
```

### Interface `User` (implementada em `src/app/lib/auth.ts`)
```ts
interface User {
  id: string
  name: string
  role: UserRole
  regiao?: string
  deputadoId?: string
  coordenadorRegionalId?: string
}
```

---

## 5. Papéis e Controle de Acesso (RBAC)

> O papel do usuário **nunca é escolhido pelo próprio usuário em produção**.
> Ele vem do banco de dados após autenticação.
> **O seletor de papel na tela de login foi REMOVIDO** — login usa CPF/e-mail + senha.

### Papéis definidos

| Role (valor no banco) | Nome exibido | Descrição |
|---|---|---|
| `lideranca` | Liderança | Acesso total, aba Administração exclusiva |
| `coordenador_geral` | Coordenador Geral | Visão agregada de todas as equipes, ligado a um deputado |
| `coordenador_regional` | Coordenador Regional | Visão da própria equipe de captadores |
| `captador_votos` | Captador de Votos | Cadastro de eleitores e agenda |
| `eleitor` | Eleitor | Recebe enquetes, sem acesso administrativo |

> ⚠️ O papel `apoiador` **não existe mais**. Foi renomeado para `captador_votos`.
> Nunca use `apoiador` em código novo.

### Abas por papel

| Aba | Liderança | Coord. Geral | Coord. Regional | Captador | Eleitor |
|---|:---:|:---:|:---:|:---:|:---:|
| Início | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contatos | ✓ | ✓ | ✓ | ✓ | — |
| Agenda | ✓ | ✓ | ✓ | ✓ | — |
| Enquetes | ✓ | ✓ | ✓ | ✓ | ✓ |
| Equipe | — | — | ✓ | — | — |
| Painel Geral | — | ✓ | — | — | — |
| Administração | ✓ | — | — | — | — |

---

## 6. Autenticação (Mock — fase atual)

Implementado em `src/app/lib/auth.ts`.

```ts
// Credenciais mock: CPF formato '000.000.000-0X' ou email 'nome@politiqui.com', senha '1234'
authenticateMock(login: string, password: string): User | null

// Usuários mock disponíveis (id, nome, role, regiao?, deputadoId?, coordenadorRegionalId?)
MOCK_USERS: User[]

// Retorna string legível para exibição (ex: "Coordenador Regional • Centro")
getUserLabel(user: User): string
```

- O login aceita CPF **ou** e-mail — sem seletor de papel visível.
- Em produção, substituir `authenticateMock` por chamada ao Supabase Auth.
- Sessão persistida em `localStorage` na chave `politiqui_user`.

---

## 7. Padrão de Props das Telas Principais

Todas as telas de nível superior recebem as props abaixo via `App.tsx`:

```ts
// CoordinationScreen, AdminScreen
interface ScreenProps {
  user: User
  electors: ElectorData[]
  canExport: boolean
}

// CaptureForm
interface CaptureFormProps {
  onSave: (elector: ElectorData) => void
  currentUser: User
  electorToEdit?: ElectorData
  onUpdate?: (elector: ElectorData) => void
}

// ElectorProfile
interface ElectorProfileProps {
  elector: ElectorData
  onEdit: () => void
}
```

- `canExport` vem de `getPermissions(user.role).canExport` (calculado em `App.tsx`).
- Nunca calcular permissões dentro do componente filho — sempre receber como prop.

---

## 8. Padrão de Exportação CSV

```ts
function exportCSV(filename: string, headers: string[], rows: string[][]): void {
  const bom = '\uFEFF'
  const csv = bom + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
```

- Sempre verificar `canExport` antes de renderizar o botão e antes de chamar a função.
- Incluir BOM (`\uFEFF`) para compatibilidade com Excel + acentos em português.

---

## 9. Padrão QR Code

### Geração (ElectorProfile.tsx)
```tsx
import { QRCodeSVG } from 'qrcode.react'

<QRCodeSVG
  value={JSON.stringify({ titulo: elector.tituloEleitor, nome: elector.nome })}
  size={180}
  level="M"
/>
```

### Leitura (CaptureForm.tsx → QrScannerModal.tsx)
- Componente: `src/app/components/QrScannerModal.tsx`
- Usa `Html5Qrcode` da lib `html5-qrcode`
- Lê via câmera, retorna `rawText` para o pai via `onScan(rawText: string)`
- O pai (`CaptureForm`) trata o texto: tenta `JSON.parse`, extrai `titulo`, fallback para texto cru
- Debounce via `useRef` (`scannedRef`) evita múltiplos disparos

---

## 10. Padrão de Persistência (localStorage)

```ts
// Salvar eleitores
localStorage.setItem('politiqui_electors', JSON.stringify(electors))

// Carregar eleitores (com migração para campos novos)
const saved = JSON.parse(localStorage.getItem('politiqui_electors') ?? '[]')
const migrated = saved.map((e: ElectorData) => ({
  createdBy: e.createdBy ?? 'unknown',
  createdByName: e.createdByName ?? 'Usuário',
  regiao: e.regiao ?? '',
  ...e,
}))
```

- Migração de registros antigos é feita no `useEffect` inicial de `App.tsx`.
- Ao adicionar novos campos à `ElectorData`, sempre adicionar migração com valor padrão.

---

## 11. Boas Práticas de Código

### Geral
- Comparar roles pela string literal (TypeScript garante o tipo via `UserRole`):
  ```ts
  // ✅ correto — TypeScript valida via union type
  if (user.role === 'coordenador_regional') { ... }

  // ❌ nunca usar 'apoiador'
  if (user.role === 'apoiador') { ... }
  ```
- Nunca commitar `.env` ou qualquer arquivo com credenciais.
- Ao editar um componente, não deixar corpo de função duplicado — verificar se o replace não deixou código antigo abaixo.

### Componentes React
- Um componente por arquivo.
- Componentes de tela em `src/app/components/`, shadcn/ui em `src/app/components/ui/`.
- Não usar roteamento — navegação é feita via estado no `App.tsx`.
- Conflito de nomes: se importar `User` de `auth.ts` e ícone `User` de lucide, usar alias:
  ```ts
  import { User as UserIcon } from 'lucide-react'
  ```

### Dados mockados
- Mock de usuários em `src/app/lib/auth.ts` (`MOCK_USERS`, `MOCK_CREDENTIALS`).
- Eleitores vivem em `localStorage` — não há arquivo de mock de eleitores.
- Ao integrar o Supabase, substituir apenas a camada de serviço — os componentes não mudam.

---

## 12. Padrão de Integração com Supabase (quando implementado)

```ts
// src/services/eleitores.service.ts
import { supabase } from '../lib/supabase'

export async function getEleitoresDoCaptador(captadorId: string) {
  const { data, error } = await supabase
    .from('eleitores')
    .select('*')
    .eq('captador_id', captadorId)
  if (error) throw error
  return data
}
```

- **Nunca** chamar `supabase` diretamente dentro de um componente.
- Toda chamada passa por `src/services/`.
- Tratar sempre o `error` retornado pelo Supabase.

---

## 13. Docker e Build

### Regras obrigatórias
- `COPY package*.json ./` **sempre antes** do `npm ci` para aproveitar cache de camadas.
- Usar `npm ci` no build — determinístico.
- Manter `.dockerignore`:
  ```
  node_modules
  dist
  .git
  .env*
  ```
- Variáveis `VITE_*` são embutidas no bundle em tempo de build — **não são segredos**.

---

## 14. Roadmap de Implementação

| # | Tarefa | Complexidade | Status |
|---|---|---|---|
| 1 | Persistência localStorage + validação tituloEleitor | Fácil | ✅ Feito |
| 2 | Auth mock (CPF/email+senha) + createdBy no eleitor | Médio | ✅ Feito |
| 3 | Exportação CSV (Admin + Coordination) + RBAC canExport | Médio | ✅ Feito |
| 4 | CoordinationScreen KPIs reais + drill-down + AdminScreen dashboard recharts | Complexo | ✅ Feito |
| 5 | QR Code geração (ElectorProfile) + leitura câmera (CaptureForm) | Médio | ✅ Feito |
| 6 | IndexedDB (Dexie) + PWA (vite-plugin-pwa) + offline sync | Complexo | 🔲 Pendente |
| 7 | Backend Supabase + autenticação real + sync bidirecional | Complexo | 🔲 Pendente |
| 8 | Testes unitários + E2E + QA | Complexo | 🔲 Pendente |

---

## 15. O Que o Agente de IA Nunca Deve Fazer

- ❌ Usar a string `'apoiador'` em qualquer código novo
- ❌ Adicionar seletor de papel na tela de login
- ❌ Usar `purple` ou `red` como cor principal de UI (só permitido em badges de papel e ações destrutivas)
- ❌ Calcular permissões dentro de componentes filhos — sempre receber como prop
- ❌ Chamar `supabase` diretamente dentro de componentes
- ❌ Implementar backend diferente de Supabase sem aprovação registrada neste arquivo
- ❌ Deixar corpo de função duplicado após replace parcial de código
- ❌ Colocar lógica de negócio dentro de componentes de apresentação

---

## 16. Decisões Pendentes

- [ ] App mobile: React Native ou Flutter?
- [ ] Deploy: Railway / Fly.io / VPS própria?
- [ ] Gerenciamento de estado global: Context API ou Zustand? (migrar quando crescer)
- [ ] Quando integrar Supabase: migrar `ElectorData` para schema do banco

---

*Última atualização: 2025 — manter este arquivo sempre sincronizado com decisões do time.*