import React, { useState } from 'react';
import { Activity, Menu, X, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'AI Assistant' },
    { id: 'symptoms', label: 'Symptom Checker' },
    { id: 'doctors', label: 'Find Specialist' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setCurrentView('dashboard')}
            >
              <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-blue-200">
                <Activity className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">
                  MediCare<span className="text-blue-600">AI</span>
                </span>
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  <ShieldAlert className="h-3 w-3 text-blue-500" />
                  <span>Informational Guidance Only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-blue-600 hover:bg-slate-50 p-2 rounded-xl transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md animate-fade-in shadow-lg">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="px-4 py-2 mt-4 text-[11px] text-amber-600 bg-amber-50/50 rounded-lg border border-amber-100/30 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Not for medical emergencies. Read disclaimer below.</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
