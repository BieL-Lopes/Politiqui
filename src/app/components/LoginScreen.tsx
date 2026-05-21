import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { UserRole, ROLE_LABELS } from '../lib/rbac';

interface LoginScreenProps {
  onLogin: (user: { name: string; role: UserRole }) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('captador_votos');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock authentication - aceita qualquer CPF/senha
    if (!cpf || !password) {
      setError('Preencha todos os campos');
      return;
    }

    // Simula login bem-sucedido com o papel selecionado
    onLogin({
      name: 'Victor',
      role: selectedRole
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">POLITIQUI</h1>
            <p className="text-gray-600">Sistema de Captação de Eleitores</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo CPF/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF ou E-mail
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                  placeholder="Digite seu CPF ou e-mail"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Selecao de Papel (Demo) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perfil de Acesso (Demo)
              </label>
              <div className="relative">
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors appearance-none bg-white"
                >
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all active:scale-98"
            >
              Entrar
            </button>

            {/* Link Esqueci Senha */}
            <div className="text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                onClick={() => alert('Em produção, enviaria e-mail de recuperação')}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>

          {/* Info de Demo */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-800 text-center">
              <strong>MODO DEMONSTRACAO:</strong> Selecione um perfil para testar diferentes niveis de acesso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
