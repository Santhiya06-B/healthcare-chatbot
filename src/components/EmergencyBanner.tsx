import React from 'react';
import { AlertOctagon, Phone, ShieldAlert, X } from 'lucide-react';

interface EmergencyBannerProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onDismiss, showDismiss = true }) => {
  const redFlags = [
    'Sudden, severe chest pain or pressure',
    'Shortness of breath or difficulty breathing',
    'Sudden weakness, numbness, or face drooping',
    'Difficulty speaking or understanding speech',
    'Severe allergic reaction (throat swelling)',
    'Sudden severe headache or loss of consciousness',
  ];

  return (
    <div className="bg-red-50 border border-red-200 rounded-3xl p-5 md:p-6 shadow-xs animate-pulse-slow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-red-600 text-white p-3 rounded-2xl shadow-md shrink-0">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-950 flex items-center gap-2">
              Medical Emergency Warning
            </h3>
            <p className="text-sm text-red-800 mt-1 leading-relaxed font-semibold">
              If you or someone else is experiencing any of the following symptoms, please do not use this chatbot. 
              <strong> Call 911 or your local emergency number immediately</strong>, or go to the nearest emergency room.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 mt-3 text-xs text-red-900 font-semibold list-disc list-inside">
              {redFlags.map((flag, idx) => (
                <li key={idx} className="marker:text-red-650">{flag}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mt-4">
              <a 
                href="tel:911" 
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-red-200 cursor-pointer"
              >
                <Phone className="h-4 w-4" />
                Call 911 / Emergency
              </a>
              <div className="inline-flex items-center gap-1.5 text-xs text-red-800 bg-red-100 px-3 py-2 rounded-xl font-medium border border-red-200/50">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                Every second counts in an emergency.
              </div>
            </div>
          </div>
        </div>
        {showDismiss && onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-red-400 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-red-100 animate-scale-up">
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="text-slate-450 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center">
          <div className="inline-flex bg-red-100 text-red-600 p-4 rounded-full mb-4 animate-bounce">
            <AlertOctagon className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-red-950">Immediate Action Required</h2>
          <p className="text-slate-650 mt-2 text-sm leading-relaxed font-semibold">
            The symptoms you mentioned are categorized as potential medical emergencies. Please stop typing and seek medical help right away.
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 my-5 text-left">
          <h4 className="text-sm font-bold text-red-950 mb-2">Red-Flag Symptoms Detected:</h4>
          <ul className="text-xs text-red-900 space-y-1.5 list-disc list-inside font-semibold">
            <li>Severe Chest Pain, Tightness or pressure</li>
            <li>Sudden, severe shortness of breath</li>
            <li>Sudden weakness, numbness, or confusion</li>
            <li>Loss of consciousness, speech, or vision</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:911"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white font-extrabold text-base py-3 px-4 rounded-xl shadow-lg shadow-red-200 text-center cursor-pointer"
          >
            <Phone className="h-5 w-5" />
            Call Emergency (911)
          </a>
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all text-slate-800 font-bold text-sm py-3 px-4 rounded-xl text-center cursor-pointer"
          >
            Dismiss & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
