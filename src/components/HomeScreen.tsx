import React from 'react';
import { Home, Search, Car, User, FileText, Heart, ArrowRight } from 'lucide-react';
import { Route } from '../types';

interface HomeScreenProps {
  onNavigate: (route: Route) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const quickActions = [
    {
      title: 'Nueva Cotización Vida',
      desc: 'Portafolio Tranquilidad',
      icon: <Heart className="w-6 h-6" />,
      route: 'vida_individual' as Route,
    },
    {
      title: 'Cotizar Autos',
      desc: 'Livianos y Pesados',
      icon: <Car className="w-6 h-6" />,
      route: 'autos' as Route,
    },
    {
      title: 'Consulta de Casos',
      desc: 'Estado de emisiones',
      icon: <Search className="w-6 h-6" />,
      route: 'consulta' as Route,
    },
  ];

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-10">
        <p className="text-bolivar-sec text-lg">Bienvenido de nuevo,</p>
        <h1 className="text-4xl font-extrabold text-bolivar-green mt-1">Juan Pérez</h1>
        <p className="text-sm text-bolivar-sec mt-2 bg-white inline-block px-3 py-1 rounded-pill border shadow-inner">
          Clave Asesor: AS-998877 | Agencia: Bogotá Central
        </p>
      </div>

      <h2 className="text-2xl mb-6">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {quickActions.map((action, i) => (
          <div
            key={i}
            onClick={() => onNavigate(action.route)}
            className="bv-card !p-6 flex flex-col gap-4 cursor-pointer hover:border-modern-green hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-bg-app text-bolivar-green group-hover:bg-modern-green group-hover:text-white transition-colors">
                {action.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main group-hover:text-bolivar-green">
                  {action.title}
                </h3>
                <p className="text-xs text-bolivar-sec">{action.desc}</p>
              </div>
            </div>
            <span className="text-xs text-bolivar-green font-bold mt-2 self-end group-hover:underline flex items-center gap-1">
              Ir ahora <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bv-card">
          <h3 className="text-xl mb-5">Actividad Reciente</h3>
          <div className="space-y-4 text-sm text-text-main opacity-70">
            <p className="p-3 bg-bg-app rounded border flex justify-between">
              <span>Cotización Vida - Ana María Silva</span>
              <span className="text-bolivar-sec">Hace 10 min</span>
            </p>
            <p className="p-3 bg-bg-app rounded border flex justify-between">
              <span>Emisión Auto - Carlos Rodríguez</span>
              <span className="text-bolivar-sec">Hace 1 hora</span>
            </p>
          </div>
        </div>
        <div className="bv-card">
          <h3 className="text-xl mb-5">Mis Metas Mes</h3>
          <p className="text-xs text-bolivar-sec">Cumplimiento Global</p>
          <p className="text-4xl font-bold text-bolivar-green mb-4">85%</p>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-modern-green h-2.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8 animate-fadeIn text-center flex flex-col items-center justify-center h-[70vh]">
    <div className="text-8xl mb-6">🚧</div>
    <h1 className="text-4xl font-extrabold text-bolivar-green mb-3">{title}</h1>
    <p className="text-xl text-bolivar-sec max-w-xl">
      Esta experiencia está actualmente en construcción. Próximamente podrás gestionar este producto desde este portal unificado.
    </p>
  </div>
);
