import React, { useState } from 'react';
import { Home, Search, Car, User, FileText, Heart, LogOut, X } from 'lucide-react';
import { HomeScreen, PlaceholderScreen } from './components/HomeScreen';
import { VidaIndividualFlow } from './components/VidaIndividualFlow';
import { ConsultaCotizaciones } from './components/ConsultaCotizaciones';
import { Route } from './types';

export default function App() {
  const [activeRoute, setActiveRoute] = useState<Route>('home');
  const [resetCounter, setResetCounter] = useState(0);
  const [historialCotizaciones, setHistorialCotizaciones] = useState<any[]>([]);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const menuConfig = [
    { type: 'item', label: 'Inicio', icon: <Home className="w-5 h-5" />, route: 'home' as Route },
    { type: 'item', label: 'Consulta Cotizaciones', icon: <Search className="w-5 h-5" />, route: 'consulta' as Route },
    
    { type: 'section', label: 'Cotizadores Individuales' },
    { type: 'item', label: 'Cotizador Autos', icon: <Car className="w-5 h-5" />, route: 'autos' as Route },
    { type: 'item', label: 'Cotizador Salud', icon: <Heart className="w-5 h-5" />, route: 'salud' as Route },
    { type: 'item', label: 'Cotizador Vida', icon: <User className="w-5 h-5" />, route: 'vida_individual' as Route },
    
    { type: 'section', label: 'Otros Servicios' },
    { type: 'item', label: 'Firma Electrónica', icon: <FileText className="w-5 h-5" />, route: 'firma' as Route },
  ];

  const renderContentBody = () => {
    switch (activeRoute) {
      case 'home':
        return <HomeScreen onNavigate={setActiveRoute} />;
      case 'vida_individual':
        return (
          <VidaIndividualFlow 
            key={`vida-${resetCounter}`}
            historialCotizaciones={historialCotizaciones} 
            setHistorialCotizaciones={setHistorialCotizaciones} 
          />
        );
      case 'autos':
        return <PlaceholderScreen title="Cotizador Autos" />;
      case 'salud':
        return <PlaceholderScreen title="Cotizador Salud" />;
      case 'consulta':
        return (
          <ConsultaCotizaciones 
            historialCotizaciones={historialCotizaciones} 
            onOpenPDF={() => setIsPDFModalOpen(true)}
          />
        );
      case 'firma':
        return <PlaceholderScreen title="Gestor de Firma Electrónica" />;
      default:
        return <HomeScreen onNavigate={setActiveRoute} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="sidebar shadow-lg">
        <div className="p-6 border-b border-gray-100 flex justify-center items-center">
          <img
            src="https://www.segurosbolivar.com/o/bolivar-theme/images/logo-seguros-bolivar.png"
            alt="Seguros Bolívar"
            className="h-10"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {menuConfig.map((item, index) => {
            if (item.type === 'section') {
              return (
                <div key={index} className="menu-section-title">
                  {item.label}
                </div>
              );
            }
            return (
              <div
                key={index}
                onClick={() => {
                  if (item.route === activeRoute && item.route === 'vida_individual') {
                    setResetCounter(prev => prev + 1);
                  }
                  setActiveRoute(item.route as Route);
                }}
                className={`menu-item ${activeRoute === item.route ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.label === 'Inicio' && activeRoute === 'home' && (
                  <span className="ml-auto text-[10px] font-bold text-bolivar-green bg-gray-100 px-2 py-0.5 rounded-pill border shadow-inner">
                    DASHBOARD
                  </span>
                )}
              </div>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100 text-center text-[10px] text-bolivar-sec bg-gray-50 opacity-60">
          Versión Portal Unificado: 1.1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 main-content">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 py-3 px-8 flex justify-end items-center sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-bolivar-green">Juan Pérez</p>
              <p className="text-[10px] text-bolivar-sec font-mono opacity-80">AS-998877</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-bolivar-yellow flex items-center justify-center font-bold text-bolivar-green border-2 border-white shadow">
              JP
            </div>
            <button className="ml-2 p-2 text-bolivar-sec hover:text-red-600 transition-colors opacity-70">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Section Title */}
        <div className="bg-white border-b shadow-inner">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {activeRoute === 'home' ? (
                '🧬 DASHBOARD PRINCIPAL'
              ) : (
                <>
                  <span className="text-gray-400 font-normal">Dashboard / </span>
                  <span>
                    {menuConfig.find((item) => item.route === activeRoute)?.label || 'Experiencia Integrada'}
                  </span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        {renderContentBody()}

        {/* PDF Modal (Shared) */}
        {isPDFModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-card w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-bolivar-green" />
                  <h3 className="font-bold text-bolivar-green">Vista Previa Cotización - Seguros Bolívar</h3>
                </div>
                <button 
                  onClick={() => setIsPDFModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-gray-200 p-8 overflow-y-auto flex justify-center">
                <div className="bg-white w-[800px] min-h-[1100px] shadow-lg p-12 relative">
                  <div className="flex justify-between items-start mb-12 border-b-4 border-bolivar-yellow pb-6">
                    <img src="https://www.segurosbolivar.com/o/bolivar-theme/images/logo-seguros-bolivar.png" alt="Logo" className="h-12" referrerPolicy="no-referrer" />
                    <div className="text-right">
                      <h1 className="text-2xl font-black text-bolivar-green uppercase tracking-tighter">Cotización Vida Individual</h1>
                      <p className="text-sm text-gray-500 font-bold">N° COT-03047271</p>
                      <p className="text-xs text-gray-400">Fecha: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Información del Tomador</h4>
                        <p className="text-sm font-bold text-bolivar-green">JUAN PÉREZ</p>
                        <p className="text-xs text-gray-500">C.C. 1.023.445.667</p>
                        <p className="text-xs text-gray-500">juan.perez@email.com</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Información del Asesor</h4>
                        <p className="text-sm font-bold text-bolivar-green">CARLOS RODRÍGUEZ</p>
                        <p className="text-xs text-gray-500">Clave: AS-998877</p>
                        <p className="text-xs text-gray-500">Agencia Bogotá</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
