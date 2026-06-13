import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  ChevronLeft, 
  Activity, 
  Stethoscope, 
  Lightbulb, 
  FileText, 
  Home, 
  Bot,
  Activity as PulseIcon
} from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isOpen,
  setIsOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'chat', label: 'AI Assistant', icon: <Bot className="h-4 w-4" /> },
    { id: 'symptoms', label: 'Symptom Checker', icon: <PulseIcon className="h-4 w-4" /> },
    { id: 'doctors', label: 'Find Specialist', icon: <Stethoscope className="h-4 w-4" /> },
    { id: 'tips', label: 'Health Tips', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'reports', label: 'Health Reports', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-slate-900 text-slate-350 border-r border-slate-800 transition-all duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-800 shrink-0">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setCurrentView('dashboard');
              setIsOpen(false);
            }}
          >
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              MediCare<span className="text-blue-500">AI</span>
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Actions */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onNewChat();
              setCurrentView('chat');
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] border border-blue-500"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="px-3 py-2 border-b border-slate-800 shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-3 mb-1.5">
            Navigation
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === item.id
                    ? 'bg-blue-600/15 text-blue-400 font-bold border-l-2 border-blue-500'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-3 mb-1.5">
            Chat History
          </span>
          {sessions.length > 0 ? (
            <div className="space-y-1">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess.id);
                    setCurrentView('chat');
                    setIsOpen(false);
                  }}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                    activeSessionId === sess.id && currentView === 'chat'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'hover:bg-slate-850 hover:text-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full pr-2">
                    <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="truncate pr-1">{sess.title}</span>
                  </div>
                  <button
                    onClick={(e) => onDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-150 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 shrink-0 transition-all"
                    title="Delete Chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-600 font-medium">
              No recent conversations
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-2 rounded-xl text-blue-500 border border-slate-700">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">MediCare AI Core</p>
              <p className="text-[10px] text-slate-500 font-medium">v1.2.0 • Offline Storage</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
