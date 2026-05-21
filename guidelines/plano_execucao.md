# Validação dos Requisitos e Plano de Execução

## Estado Atual do Projeto

| Requisito do Documento | Status no Código |
|---|---|
| Campo "Título de Eleitor" no cadastro | ✅ Em CaptureForm.tsx com máscara |
| Renomear "Apoiador" → "Cabo Eleitoral" | ✅ Não existe `apoiador` no código; já é `cabo_eleitoral` |
| 5 papéis (lideranca, coord. geral, coord. regional, captador, eleitor) | ✅ rbac.ts |
| Abas condicionais por papel | ✅ BottomNav.tsx + canAccessTab |
| Aba Admin (só Liderança) | ✅ AdminScreen.tsx (mockado) |
| Aba Coordenação | ✅ CoordinationScreen.tsx (mock por região, **não** por captador) |
| Exportação CSV/PDF | ✅ ContactList.tsx |
| Persistência local básica | 🟡 localStorage em App.tsx — **bug**: não limpa quando electors vai a zero |
| Mostrar título no perfil do eleitor | ❓ Verificar ElectorProfile.tsx |
| QR Code (ler/gerar) | ❌ Nada |
| Visão do coordenador por captador | ❌ Hoje é por região, mock |
| Tela exclusiva do Coordenador Geral (vínculo com deputado) | ❌ |
| Dashboard real (dados agregados) | ❌ Tudo mock |
| Offline-first real (PWA/IndexedDB/sync) | ❌ Só localStorage, sem service worker |
| Vincular eleitor ao captador que cadastrou (createdBy) | ❌ |
| Edição de eleitor | ❌ Form só cria |
| Backend/API + sincronização | ❌ |

## Plano de Execução (do mais fácil ao mais complexo)

### Nível 1 — Ajustes rápidos
1. Corrigir bug de persistência em App.tsx: salvar sempre, mesmo com lista vazia.
2. Mostrar `tituloEleitor` no perfil (ElectorProfile.tsx) se ainda não aparece.
3. Validar título (12 dígitos) antes do submit em CaptureForm.
4. Limpar referências antigas a "Apoiador" em comentários/labels (se houver).

### Nível 2 — Modelo de dados
5. Adicionar campos em ElectorData: `createdBy`, `createdByName`, `regiao`.
6. Adicionar entidade User real (id, nome, role, regiao, deputadoId) no localStorage e no login.
7. Edição de eleitor (reaproveitar CaptureForm com modo edit).

### Nível 3 — Exportação ampliada
8. Botão de exportar também em Admin/Coordenação (CSV de usuários, CSV agregado).
9. Limitar exportação por RBAC (canExport).

### Nível 4 — Coordenação real
10. Reformular CoordinationScreen.tsx para listar captadores da equipe com KPIs reais (eleitores cadastrados, último cadastro, % da meta), agrupando electors por createdBy.
11. Criar tela do Coordenador Geral com visão por coordenador regional → por captador (drill-down), vinculada ao deputadoId.
12. Dashboard de Liderança em AdminScreen com gráficos (recharts): por região, por nível de voto, por nicho, evolução por dia.

### Nível 5 — QR Code
13. Instalar qrcode.react (gerar) e @yudiel/react-qr-scanner ou html5-qrcode (ler).
14. Gerar QR no perfil do eleitor codificando tituloEleitor (ou JSON mínimo).
15. Escanear QR no fluxo de novo cadastro: botão "Escanear título" preenche o campo automaticamente. Tratar permissão de câmera + debounce.

### Nível 6 — Offline-first real
16. Migrar storage de localStorage para IndexedDB via idb ou Dexie.
17. Transformar o app em PWA: adicionar vite-plugin-pwa, manifest, ícones, service worker.
18. Fila de sincronização: tabela pending_changes (create/update/delete), flush quando navigator.onLine.
19. Indicador visual de status online/offline e de itens pendentes.

### Nível 7 — Backend + sync
20. Definir API (REST/Supabase/Firebase) com endpoints de electors, users, polls, agenda.
21. Autenticação real (substituir mock no LoginScreen).
22. Sincronização bidirecional com resolução de conflitos.
23. Permissões no servidor refletindo o RBAC do cliente.

### Nível 8 — Qualidade
24. Testes unitários do rbac.ts e dos reducers de eleitores.
25. Testes E2E do fluxo captador (cadastro offline → sync).
26. QA manual em dispositivo Android instalando o PWA.

---

**Observação:**
- O projeto já cobre boa parte do básico, mas as partes de QR Code, dashboards reais, offline avançado e coordenação detalhada ainda precisam ser implementadas.
- Recomendo seguir a ordem acima para garantir entregas incrementais e testáveis.
