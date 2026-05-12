import { Home, Users, Calendar, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'contacts' | 'agenda' | 'polls';
  onTabChange: (tab: 'home' | 'contacts' | 'agenda' | 'polls') => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Início' },
    { id: 'contacts' as const, icon: Users, label: 'Contatos' },
    { id: 'agenda' as const, icon: Calendar, label: 'Agenda' },
    { id: 'polls' as const, icon: BarChart3, label: 'Enquetes' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-3 transition-all ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
