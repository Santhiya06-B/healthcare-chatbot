import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { SymptomChecker } from './components/SymptomChecker';
import { DoctorRecommendations } from './components/DoctorRecommendations';
import { HealthTips } from './components/HealthTips';
import { HealthReports } from './components/HealthReports';
import { EmergencyBanner } from './components/EmergencyBanner';
import { askGemini } from './services/gemini';
import { 
  Menu, 
  Sparkles, 
  Heart, 
  Droplet, 
  PhoneCall, 
  Activity,
  Lightbulb,
  Plus
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [recommendedSpecialist, setRecommendedSpecialist] = useState<string>('');

  const clearRecommendation = () => {
    setRecommendedSpecialist('');
  };

  const handleSpecialistRecommendation = (specialist: string) => {
    setRecommendedSpecialist(specialist);
  };

  // Chat Sessions States
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessionMessages, setSessionMessages] = useState<Record<string, Message[]>>({});
  
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>('');

  // Dashboard Water Intake State
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const WATER_GOAL = 2000; // 2L

  // Load chat history & water logs from localStorage
  useEffect(() => {
    try {
      // 1. Load water intake
      const todayStr = new Date().toDateString();
      const storedWaterDate = localStorage.getItem('medicare_water_date');
      if (storedWaterDate === todayStr) {
        const storedWater = localStorage.getItem('medicare_water_amount');
        if (storedWater) setWaterIntake(parseInt(storedWater));
      } else {
        localStorage.setItem('medicare_water_date', todayStr);
        localStorage.setItem('medicare_water_amount', '0');
      }

      // 2. Load chat sessions
      const storedSessions = localStorage.getItem('medicare_sessions');
      const storedMessages = localStorage.getItem('medicare_sessions_messages');
      
      if (storedSessions && storedMessages) {
        const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
        const parsedMessages = JSON.parse(storedMessages) as Record<string, Message[]>;
        setSessions(parsedSessions);
        setSessionMessages(parsedMessages);
        
        if (parsedSessions.length > 0) {
          setActiveSessionId(parsedSessions[0].id);
        } else {
          createNewSession();
        }
      } else {
        createNewSession();
      }
    } catch (err) {
      console.error('LocalStorage parsing error:', err);
      createNewSession();
    }
  }, []);

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      timestamp: new Date().toLocaleDateString()
    };
    const initialMsg: Message[] = [
      {
        role: 'model',
        parts: [{ text: "Hello! I am **MediCare AI**, your informational healthcare chatbot. How can I help you today?\n\n*Please note: I can suggest possibilities and recommend specialists, but I cannot replace professional medical advice.*" }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    const updatedSessions = [newSession, ...sessions];
    const updatedMessages = { ...sessionMessages, [newId]: initialMsg };

    setSessions(updatedSessions);
    setSessionMessages(updatedMessages);
    setActiveSessionId(newId);

    localStorage.setItem('medicare_sessions', JSON.stringify(updatedSessions));
    localStorage.setItem('medicare_sessions_messages', JSON.stringify(updatedMessages));
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setChatError('');
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedSessions = sessions.filter(s => s.id !== id);
    const updatedMessages = { ...sessionMessages };
    delete updatedMessages[id];

    setSessions(updatedSessions);
    setSessionMessages(updatedMessages);

    localStorage.setItem('medicare_sessions', JSON.stringify(updatedSessions));
    localStorage.setItem('medicare_sessions_messages', JSON.stringify(updatedMessages));

    if (activeSessionId === id) {
      if (updatedSessions.length > 0) {
        setActiveSessionId(updatedSessions[0].id);
      } else {
        // Create a blank session if list is empty
        const newId = Date.now().toString();
        const newSession = {
          id: newId,
          title: 'New Conversation',
          timestamp: new Date().toLocaleDateString()
        };
        const initialMsg: Message[] = [
          {
            role: 'model',
            parts: [{ text: "Hello! I am **MediCare AI**, your informational healthcare chatbot. How can I help you today?\n\n*Please note: I can suggest possibilities and recommend specialists, but I cannot replace professional medical advice.*" }],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        setSessions([newSession]);
        setSessionMessages({ [newId]: initialMsg });
        setActiveSessionId(newId);
        localStorage.setItem('medicare_sessions', JSON.stringify([newSession]));
        localStorage.setItem('medicare_sessions_messages', JSON.stringify({ [newId]: initialMsg }));
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return;

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      role: 'user',
      parts: [{ text }],
      timestamp: timestampStr
    };

    const currentMsgs = sessionMessages[activeSessionId] || [];
    const updatedMsgs = [...currentMsgs, userMsg];

    // Check if we need to auto-title the session based on the first query
    let updatedSessions = [...sessions];
    const targetSessionIndex = sessions.findIndex(s => s.id === activeSessionId);
    if (targetSessionIndex !== -1 && sessions[targetSessionIndex].title === 'New Conversation') {
      const truncatedTitle = text.split(' ').slice(0, 4).join(' ') + (text.split(' ').length > 4 ? '...' : '');
      updatedSessions[targetSessionIndex] = {
        ...updatedSessions[targetSessionIndex],
        title: truncatedTitle
      };
      setSessions(updatedSessions);
      localStorage.setItem('medicare_sessions', JSON.stringify(updatedSessions));
    }

    setSessionMessages(prev => ({
      ...prev,
      [activeSessionId]: updatedMsgs
    }));
    setChatLoading(true);
    setChatError('');

    try {
      // Format chat logs history for Gemini SDK
      const historyFormatted = currentMsgs.map(m => ({
        role: m.role,
        parts: m.parts
      }));

      const reply = await askGemini(text, historyFormatted);
      
      const botMsg: Message = {
        role: 'model',
        parts: [{ text: reply }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMsgs = [...updatedMsgs, botMsg];
      
      const newSessionMessages = {
        ...sessionMessages,
        [activeSessionId]: finalMsgs
      };

      setSessionMessages(newSessionMessages);
      localStorage.setItem('medicare_sessions_messages', JSON.stringify(newSessionMessages));
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'Failed to generate response. Check your API key or connection.');
    } finally {
      setChatLoading(false);
    }
  };

  const logWater = () => {
    const updated = Math.min(waterIntake + 250, 4000);
    setWaterIntake(updated);
    localStorage.setItem('medicare_water_amount', updated.toString());
  };

  const resetWater = () => {
    setWaterIntake(0);
    localStorage.setItem('medicare_water_amount', '0');
  };

  const handleQuickAction = (topic: string) => {
    setCurrentView('chat');
    // Pre-populate chat with the prompt
    let prompt = '';
    if (topic === 'Fever') prompt = 'I have a fever. What are some self-care tips and potential causes?';
    else if (topic === 'Headache') prompt = 'I have a headache. What can I do to relieve it and when should I see a doctor?';
    else if (topic === 'Cold & Cough') prompt = 'What should I do for a mild cold and cough?';
    else if (topic === 'Diabetes') prompt = 'What are the symptoms and preventive measures for Type 2 Diabetes?';
    else if (topic === 'Blood Pressure') prompt = 'How can I lower my blood pressure naturally through lifestyle habits?';

    if (prompt) {
      handleSendMessage(prompt);
    }
  };

  const activeMessages = sessionMessages[activeSessionId] || [];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F8FAFC]">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={createNewSession}
      />

      {/* Main Display Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 md:hidden cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1 rounded-lg">
                <Heart className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-800 tracking-tight sm:text-base">
                MediCare<span className="text-blue-600">AI</span> Portal
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-450 font-bold border border-slate-200/50 bg-slate-50 px-2 py-0.5 rounded flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            <span>Informational Guidance Only</span>
          </div>
        </header>

        {/* View Content Workspace */}
        <div className="flex-1 overflow-y-auto">
          
          {/* VIEW 1: Dashboard */}
          {currentView === 'dashboard' && (
            <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
              
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md border border-blue-900/50">
                <div className="absolute right-[-80px] top-[-80px] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-2.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-200 bg-white/10 backdrop-blur-md border border-white/10">
                    <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                    <span>Redesigned Clinical Workspace</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-1">
                    Welcome to MediCare AI
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed">
                    Access offline symptom evaluations, store local medical documents privately, log water targets, and consult our AI regarding common wellness topics.
                  </p>
                </div>
              </div>

              {/* Emergency Alert Banner */}
              <EmergencyBanner showDismiss={false} />

              {/* Quick Action Buttons */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider">
                  Quick Symptoms Search
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Fever', 'Headache', 'Cold & Cough', 'Diabetes', 'Blood Pressure'].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleQuickAction(topic)}
                      className="bg-white hover:bg-blue-600 hover:text-white border border-slate-200/60 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4-Column Medical Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Heart Rate Guide */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-400">Heart Rate Guide</span>
                    <Heart className="h-5 w-5 text-rose-500 animate-pulse" />
                  </div>
                  <div className="my-4 space-y-1">
                    <div className="text-2xl font-black text-slate-800">60 - 100</div>
                    <div className="text-[10px] text-slate-450 font-bold uppercase">normal resting range (bpm)</div>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 border-t border-slate-100 pt-2 leading-relaxed">
                    Active: 100-140 bpm. Consult a specialist if resting heart rate regularly falls below 60 or exceeds 100.
                  </div>
                </div>

                {/* 2. Water Intake Tracker */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-400">Water Log</span>
                    <Droplet className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="my-3 space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800">{waterIntake}</span>
                      <span className="text-xs text-slate-400 font-bold">/ {WATER_GOAL} ml</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((waterIntake / WATER_GOAL) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-slate-100 pt-2 shrink-0">
                    <button 
                      onClick={logWater}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] py-1.5 px-2 rounded-lg border border-blue-100/50 cursor-pointer active:scale-95 transition-all text-center"
                    >
                      +250ml
                    </button>
                    <button 
                      onClick={resetWater}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-450 font-bold text-[10px] py-1.5 px-2 rounded-lg border border-slate-200/50 cursor-pointer active:scale-95 transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* 3. Today's Tip Preview */}
                <div 
                  onClick={() => setCurrentView('tips')}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-400">Daily Tip Preview</span>
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="my-4 space-y-0.5">
                    <div className="text-sm font-black text-slate-800 line-clamp-1">Prioritize Whole Foods</div>
                    <p className="text-[10px] text-slate-450 font-semibold line-clamp-2 leading-relaxed">
                      Fill 70% of your plate with vegetables, fruits, whole grains...
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 pt-2 border-t border-slate-100 flex items-center gap-0.5">
                    Open Health Carousel →
                  </div>
                </div>

                {/* 4. Emergency Helplines */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-400">helplines</span>
                    <PhoneCall className="h-5 w-5 text-red-500 animate-pulse" />
                  </div>
                  <div className="my-3 text-xs font-bold text-slate-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emergency:</span>
                      <a href="tel:911" className="text-red-600 hover:underline">911</a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Poison Help:</span>
                      <a href="tel:18002221222" className="text-slate-655 hover:underline">1-800-222-1222</a>
                    </div>
                  </div>
                  <div className="text-[9px] font-semibold text-slate-450 pt-2 border-t border-slate-100 leading-tight">
                    Keep emergency numbers saved offline for fast access in triage crises.
                  </div>
                </div>

              </div>

              {/* Health Tips Slider Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-850 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Health & Wellness Guidelines
                </h3>
                <HealthTips />
              </div>

            </div>
          )}

          {/* VIEW 2: Chat Assistant */}
          {currentView === 'chat' && (
            <div className="h-full">
              <ChatInterface
                messages={activeMessages}
                loading={chatLoading}
                error={chatError}
                onSendMessage={handleSendMessage}
                activeSessionTitle={sessions.find(s => s.id === activeSessionId)?.title || 'MediCare AI Chatbot'}
              />
            </div>
          )}

          {/* VIEW 3: Symptom Checker */}
          {currentView === 'symptoms' && (
            <div className="p-4 sm:p-6 md:p-8 animate-fade-in">
              <SymptomChecker 
                onSpecialistRecommendation={handleSpecialistRecommendation}
                setCurrentView={setCurrentView}
              />
            </div>
          )}

          {/* VIEW 4: Doctor Directory */}
          {currentView === 'doctors' && (
            <div className="p-4 sm:p-6 md:p-8 animate-fade-in max-w-5xl mx-auto space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-850">Medical Specialists Directory</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                  Connect with our simulated medical team. Find appropriate specialists and schedule appointments.
                </p>
              </div>
              <DoctorRecommendations 
                recommendedSpecialist={recommendedSpecialist}
                clearRecommendation={clearRecommendation}
              />
            </div>
          )}

          {/* VIEW 5: Tips (Carousel View) */}
          {currentView === 'tips' && (
            <div className="p-4 sm:p-6 md:p-8 animate-fade-in max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-850">Health Guidelines Carousel</h2>
                <p className="text-xs text-slate-500 font-semibold">Select categories to view recommended wellness insights.</p>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
                <HealthTips />
              </div>
            </div>
          )}

          {/* VIEW 6: Local Reports Upload */}
          {currentView === 'reports' && (
            <div className="p-4 sm:p-6 md:p-8 animate-fade-in">
              <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-850">Health Reports & Prescriptions</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed font-sans">
                  Upload PDF medical reports or image prescriptions. Stored securely inside your browser's local sandbox.
                </p>
              </div>
              <HealthReports />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;
