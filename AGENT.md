# AGENT.md — Politiqui

> Este arquivo é a fonte da verdade para qualquer agente de IA ou desenvolvedor trabalhando neste projeto.
> **Nunca assuma, invente ou extrapole** informações que não estejam documentadas aqui.
> Se algo não estiver descrito, pergunte antes de implementar.

---

## 1. Visão Geral do Projeto

**Nome:** Politiqui  
**Descrição:** Sistema de captação de eleitores para campanhas políticas.  
**Estágio atual:** Frontend em React com dados mockados (sem backend real ainda).  
**Plataforma:** Web (React) + futura versão mobile (a definir).

---

## 2. Stack Tecnológica

### Frontend (atual)
- **Framework:** React (Vite)
- **Linguagem:** JavaScript/TypeScript (confirmar com o time)
- **Estilização:** (documentar aqui: Tailwind / CSS Modules / Styled Components)
- **Roteamento:** (documentar aqui: React Router / TanStack Router)
- **Estado global:** (documentar aqui: Context API / Zustand / Redux)
- **Dados:** Mockados localmente — sem chamadas reais a API ainda

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

## 3. Arquitetura de Dados

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

### Campos obrigatórios do Eleitor
- `id`
- `nome`
- `endereco`
- `cpf` ou `email`
- `titulo_eleitor` ← campo adicionado (ver tarefa #2 do roadmap)
- `captador_id` (FK para o usuário captador)
- `criado_em`

---

## 4. Papéis e Controle de Acesso (RBAC)

> O papel do usuário **nunca é escolhido pelo próprio usuário em produção**.
> Ele vem do banco de dados após autenticação. O seletor de papel na tela de login
> existe apenas para fins de **demonstração (demo)** e deve ser removido
> ao integrar o backend real.

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

## 5. Boas Práticas de Código

### Geral
- Sempre usar a constante de role, **nunca a string crua** em condicionais:
  ```js
  // ✅ correto
  if (user.role === ROLES.CAPTADOR_VOTOS) { ... }

  // ❌ errado
  if (user.role === 'captador') { ... }
  ```
- Centralizar todos os textos exibidos ao usuário em um arquivo de strings (`src/constants/strings.js` ou similar). Nunca hardcodar texto de UI diretamente no componente.
- Nunca commitar `.env` ou qualquer arquivo com credenciais.

### Componentes React
- Um componente por arquivo.
- Componentes de página em `src/pages/`, componentes reutilizáveis em `src/components/`.
- Guard de rota obrigatório para qualquer tela que exige autenticação:
  ```jsx
  <PrivateRoute allowedRoles={[ROLES.COORDENADOR_REGIONAL]}>
    <TelaEquipe />
  </PrivateRoute>
  ```

### Dados mockados (fase atual)
- Mocks ficam em `src/mocks/`.
- Cada entidade tem seu próprio arquivo: `eleitores.mock.js`, `usuarios.mock.js`, etc.
- Ao integrar o Supabase, substituir apenas a camada de serviço (`src/services/`) — os componentes não devem saber se o dado é mock ou real.

---

## 6. Padrão de Integração com Supabase (quando implementado)

```js
// src/services/eleitores.service.js

import { supabase } from '../lib/supabase'

export async function getEleitoresDoCaptador(captadorId) {
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

## 7. Docker e Build

### Regras obrigatórias
- O `COPY package*.json ./` **sempre antes** do `npm ci` para aproveitar cache de camadas.
- Usar `npm ci` (não `npm install`) no build — é mais rápido e determinístico.
- Manter `.dockerignore` atualizado. Mínimo obrigatório:
  ```
  node_modules
  dist
  .git
  .env*
  ```
- Todo `RUN` que instala pacotes de SO deve agrupar em um único comando e remover o cache ao final:
  ```dockerfile
  RUN apk add --no-cache tzdata \
      && cp /usr/share/zoneinfo/$TZ /etc/localtime \
      && echo $TZ > /etc/timezone \
      && apk del tzdata
  ```

### Variáveis de ambiente
- Variáveis `VITE_*` são embutidas no bundle em tempo de build — **não são segredos**.
- Nunca colocar tokens ou chaves privadas em variáveis `VITE_*`.
- Segredos reais ficam apenas no backend/Supabase, nunca no frontend.

---

## 8. Roadmap de Implementação

Ordem definida em reunião. **Não alterar a prioridade sem aprovação do time.**

| # | Tarefa | Complexidade | Status |
|---|---|---|---|
| 1 | Renomear "Apoiador" → "Cabo Eleitoral" | Fácil | 🔲 |
| 2 | Adicionar campo "Título de Eleitor" | Fácil | 🔲 |
| 3 | Exportação de dados (CSV/PDF) | Médio | 🔲 |
| 4 | RBAC e abas condicionais por papel | Médio | 🔲 |
| 5 | QR Code (geração e leitura) | Médio | 🔲 |
| 6 | Tela do Coordenador Regional | Médio | 🔲 |
| 7 | Dashboard gerencial (Coord. Geral / Liderança) | Complexo | 🔲 |
| 8 | Modo offline nos celulares | Complexo | 🔲 |

---

## 9. O Que o Agente de IA Nunca Deve Fazer

- ❌ Inventar nomes de roles que não estão na tabela da seção 4
- ❌ Usar a string `'apoiador'` em qualquer código novo
- ❌ Sugerir chamar APIs externas que não estão documentadas aqui
- ❌ Criar estrutura de pastas diferente da definida na seção 5
- ❌ Implementar backend diferente de Supabase sem aprovação registrada neste arquivo
- ❌ Remover o `.dockerignore` ou alterar a ordem do Dockerfile sem justificativa
- ❌ Hardcodar textos de UI em componentes
- ❌ Colocar lógica de negócio dentro de componentes de apresentação

---

## 10. Dúvidas e Decisões Pendentes

> Registrar aqui toda decisão que ainda não foi tomada. O agente deve perguntar
> antes de assumir qualquer uma dessas indefinições.

- [ ] Biblioteca de estilização (Tailwind / CSS Modules / outra?)
- [ ] Biblioteca de roteamento (React Router v6 / TanStack?)
- [ ] Gerenciamento de estado global (Context API / Zustand?)
- [ ] O seletor de papel na tela de login será mantido em staging ou removido?
- [ ] Migrar valor `'apoiador'` no banco ou manter e só trocar o rótulo visual?
- [ ] App mobile será React Native ou Flutter?
- [ ] Deploy em qual plataforma? (Railway / Fly.io / VPS própria?)

---

*Última atualização: 2025 — manter este arquivo sempre sincronizado com decisões do time.*