import { UserRole, ROLE_LABELS } from './rbac';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  regiao?: string;
  deputadoId?: string;
  coordenadorRegionalId?: string;
}

interface MockCredential {
  userId: string;
  cpf: string;
  email: string;
  password: string;
}

// Credenciais de acesso para o ambiente de demonstracao
const MOCK_CREDENTIALS: MockCredential[] = [
  { userId: 'u1', cpf: '000.000.000-01', email: 'victor@politiqui.com',   password: '1234' },
  { userId: 'u2', cpf: '000.000.000-02', email: 'ana@politiqui.com',      password: '1234' },
  { userId: 'u3', cpf: '000.000.000-03', email: 'carlos@politiqui.com',   password: '1234' },
  { userId: 'u4', cpf: '000.000.000-04', email: 'fernanda@politiqui.com', password: '1234' },
  { userId: 'u5', cpf: '000.000.000-05', email: 'rafael@politiqui.com',   password: '1234' },
  { userId: 'u6', cpf: '000.000.000-06', email: 'juliana@politiqui.com',  password: '1234' },
  { userId: 'u7', cpf: '000.000.000-07', email: 'marcos@politiqui.com',   password: '1234' },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Victor Costa',   role: 'lideranca' },
  { id: 'u2', name: 'Ana Oliveira',   role: 'coordenador_geral',   deputadoId: 'dep1' },
  { id: 'u3', name: 'Carlos Mendes',  role: 'coordenador_regional', regiao: 'Centro',     deputadoId: 'dep1' },
  { id: 'u4', name: 'Fernanda Lima',  role: 'coordenador_regional', regiao: 'Zona Norte', deputadoId: 'dep1' },
  { id: 'u5', name: 'Rafael Souza',   role: 'captador_votos', regiao: 'Centro',     coordenadorRegionalId: 'u3' },
  { id: 'u6', name: 'Juliana Santos', role: 'captador_votos', regiao: 'Zona Norte', coordenadorRegionalId: 'u4' },
  { id: 'u7', name: 'Marcos Eleitor', role: 'eleitor' },
];

/**
 * Autentica contra as credenciais mock.
 * Aceita CPF (com ou sem formatacao) ou e-mail, mais senha.
 * Retorna o User se valido, null caso contrario.
 */
export function authenticateMock(login: string, password: string): User | null {
  const normalizedDigits = login.replace(/\D/g, '');
  const cred = MOCK_CREDENTIALS.find(c => {
    const cpfMatch = c.cpf.replace(/\D/g, '') === normalizedDigits;
    const emailMatch = c.email.toLowerCase() === login.toLowerCase().trim();
    return (cpfMatch || emailMatch) && c.password === password;
  });
  if (!cred) return null;
  return MOCK_USERS.find(u => u.id === cred.userId) ?? null;
}

export function getUserLabel(user: User): string {
  const roleLabel = ROLE_LABELS[user.role];
  return user.regiao
    ? `${user.name} — ${roleLabel} / ${user.regiao}`
    : `${user.name} — ${roleLabel}`;
}
