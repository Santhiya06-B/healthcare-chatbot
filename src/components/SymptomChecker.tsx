import React, { useState } from 'react';
import { askGemini, isApiKeyConfigured } from '../services/gemini';
import { EmergencyModal } from './EmergencyBanner';
import { Activity, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle, UserCheck, ShieldAlert, Sparkles, AlertOctagon, Phone } from 'lucide-react';

interface SymptomCheckerProps {
  onSpecialistRecommendation: (specialist: string) => void;
  setCurrentView: (view: string) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ 
  onSpecialistRecommendation,
  setCurrentView 
}) => {
  const [step, setStep] = useState<number>(1);
  const [primarySymptom, setPrimarySymptom] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [otherSymptomText, setOtherSymptomText] = useState<string>('');
  
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string>('');

  const primarySymptoms = [
    { id: 'chest_pain', label: 'Chest Pain or Pressure', isEmergency: true },
    { id: 'breathing', label: 'Difficulty Breathing / Shortness of Breath', isEmergency: true },
    { id: 'bleeding', label: 'Severe / Heavy Bleeding', isEmergency: true },
    { id: 'fever_cough', label: 'Fever or Cough', isEmergency: false },
    { id: 'headache', label: 'Headache', isEmergency: false },
    { id: 'digestive', label: 'Stomach Pain / Digestive Issues', isEmergency: false },
    { id: 'rash', label: 'Skin Rash or Itching', isEmergency: false },
    { id: 'joint_pain', label: 'Joint or Muscle Pain', isEmergency: false },
    { id: 'fatigue', label: 'Chronic Fatigue or Weakness', isEmergency: false },
    { id: 'other', label: 'Other Symptom', isEmergency: false },
  ];

  const durations = [
    { id: 'less_24', label: 'Less than 24 hours' },
    { id: '1_3_days', label: '1 to 3 days' },
    { id: '4_7_days', label: '4 to 7 days' },
    { id: 'week_plus', label: 'More than a week' },
  ];

  const associatedList = [
    { id: 'nausea', label: 'Nausea or Vomiting', isEmergency: false },
    { id: 'dizziness', label: 'Dizziness or Lightheadedness', isEmergency: false },
    { id: 'high_fever', label: 'High Fever (>103°F / 39.4°C)', isEmergency: false },
    { id: 'speech_diff', label: 'Difficulty Speaking or Slurring Words', isEmergency: true },
    { id: 'vision_diff', label: 'Sudden Double or Blurred Vision', isEmergency: true },
    { id: 'cough', label: 'Persistent Cough', isEmergency: false },
  ];

  const ageGroups = [
    { id: 'child', label: 'Pediatric (0-12 years)' },
    { id: 'teen', label: 'Adolescent (13-17 years)' },
    { id: 'adult', label: 'Adult (18-64 years)' },
    { id: 'senior', label: 'Senior (65+ years)' },
  ];

  const handlePrimarySelect = (symptomId: string, isEmergency: boolean) => {
    setPrimarySymptom(symptomId);
    if (isEmergency) {
      setIsEmergencyOpen(true);
    } else {
      setStep(2);
    }
  };

  const handleAssociatedToggle = (id: string, isEmergency: boolean) => {
    if (isEmergency) {
      setIsEmergencyOpen(true);
      return;
    }
    setAssociatedSymptoms(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 2 && duration) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4 && ageGroup) handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetChecker = () => {
    setStep(1);
    setPrimarySymptom('');
    setDuration('');
    setAssociatedSymptoms([]);
    setAgeGroup('');
    setOtherSymptomText('');
    setReport('');
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    const symptomName = primarySymptom === 'other' 
      ? `Other: ${otherSymptomText}` 
      : primarySymptoms.find(s => s.id === primarySymptom)?.label || '';

    const durationLabel = durations.find(d => d.id === duration)?.label || '';
    const ageGroupLabel = ageGroups.find(a => a.id === ageGroup)?.label || '';
    const selectedAssoc = associatedSymptoms.map(id => associatedList.find(a => a.id === id)?.label).filter(Boolean);

    const prompt = `Perform a triage check for a person in the "${ageGroupLabel}" age category.
Primary symptom: "${symptomName}"
Duration: "${durationLabel}"
Associated symptoms: ${selectedAssoc.length > 0 ? selectedAssoc.join(', ') : 'None'}

Please formulate a helpful health assessment. Keep your language clear, objective, and supportive. Use markdown styling.

Provide:
1. **Disclaimer**: Informational guidance only. Not a diagnosis.
2. **Analysis**: Explain potential mild to moderate causes for these symptoms.
3. **Recommended Specialist**: Suggest the type of specialist they should see (e.g. Cardiologist, Dermatologist, ENT, Gastroenterologist, General Practitioner/Primary Care Physician) and make sure to explicitly use the specialist name in bold.
4. **General Home Care Guidelines**: Safe, simple self-care tips.
5. **Red Flags**: Explicitly list warning signs that would require visiting an ER.`;

    try {
      if (!isApiKeyConfigured()) {
        throw new Error('Google Gemini API Key is not configured. Please add VITE_GOOGLE_API_KEY to your .env file in the project directory.');
      }
      
      const response = await askGemini(prompt);
      setReport(response);
      setStep(5); // Show report step

      // Extract recommended specialist from text for linking
      const textToScan = response.toLowerCase();
      let detectedSpecialist = '';
      if (textToScan.includes('cardiologist')) detectedSpecialist = 'Cardiologist';
      else if (textToScan.includes('dermatologist')) detectedSpecialist = 'Dermatologist';
      else if (textToScan.includes('gastroenterologist')) detectedSpecialist = 'Gastroenterologist';
      else if (textToScan.includes('neurologist')) detectedSpecialist = 'Neurologist';
      else if (textToScan.includes('pediatrician')) detectedSpecialist = 'Pediatrician';
      else if (textToScan.includes('pulmonologist')) detectedSpecialist = 'Pulmonologist';
      else if (textToScan.includes('ent') || textToScan.includes('otolaryngologist')) detectedSpecialist = 'Otolaryngologist (ENT)';
      else if (textToScan.includes('orthopedist') || textToScan.includes('orthopedic')) detectedSpecialist = 'Orthopedic Specialist';
      
      if (detectedSpecialist) {
        onSpecialistRecommendation(detectedSpecialist);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during symptom analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />

      {/* Red Emergency Warning Banner (Card) */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-5 md:p-6 shadow-xs flex items-start gap-4">
        <div className="bg-red-600 text-white p-3 rounded-2xl shrink-0">
          <AlertOctagon className="h-6 w-6 animate-bounce" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-red-950">CRITICAL HEALTH ALERT</h3>
          <p className="text-xs text-red-805 mt-1 leading-relaxed font-semibold">
            If you are experiencing severe symptoms like <span className="font-black text-red-950">Chest Pain</span>, <span className="font-black text-red-950">Difficulty Breathing</span>, or <span className="font-black text-red-950">Severe / Heavy Bleeding</span>, DO NOT use this form. Call emergency services immediately.
          </p>
          <div className="flex gap-3 mt-3">
            <a href="tel:911" className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-all">
              <Phone className="h-3.5 w-3.5" /> Call 911
            </a>
          </div>
        </div>
      </div>

      {/* Main Questionnaire Box */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Interactive Symptom Checker</h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Select your symptoms to receive an educational, AI-powered health analysis.
              </p>
            </div>
          </div>
          <div className="absolute right-6 bottom-[-20px] opacity-10 pointer-events-none hidden sm:block">
            <Sparkles className="h-28 w-28 text-white" />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Progress Bar */}
          {step < 5 && (
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>STEP {step} OF 4</span>
                <span>{Math.round(((step - 1) / 3) * 100)}% COMPLETE</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((step) / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* STEP 1: Primary Symptom */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800">What is your primary symptom?</h3>
              <p className="text-xs text-slate-400 font-semibold">Select the symptom that is causing you the most concern.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {primarySymptoms.map((sym) => (
                  <button
                    key={sym.id}
                    onClick={() => handlePrimarySelect(sym.id, sym.isEmergency)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer ${
                      primarySymptom === sym.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs'
                        : 'border-slate-200/60 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                    } ${sym.isEmergency ? 'hover:border-red-200 hover:bg-red-50/20' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      {sym.isEmergency && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />}
                      {sym.label}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-50 shrink-0" />
                  </button>
                ))}
              </div>
              {primarySymptom === 'other' && (
                <div className="mt-4 animate-fade-in space-y-2">
                  <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase">Describe your primary symptom</label>
                  <input
                    type="text"
                    value={otherSymptomText}
                    onChange={(e) => setOtherSymptomText(e.target.value)}
                    placeholder="e.g., runny nose, sore throat, ear pain"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-700 bg-white"
                  />
                  <button
                    onClick={() => setStep(2)}
                    disabled={!otherSymptomText.trim()}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Duration */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800">How long have you had this symptom?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {durations.map((dur) => (
                  <button
                    key={dur.id}
                    onClick={() => setDuration(dur.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer ${
                      duration === dur.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs'
                        : 'border-slate-200/60 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{dur.label}</span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!duration}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Associated Symptoms */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800">Are you experiencing other associated symptoms?</h3>
              <p className="text-xs text-slate-400 font-semibold">Select all that apply. Leave unselected if none apply.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {associatedList.map((assoc) => (
                  <button
                    key={assoc.id}
                    onClick={() => handleAssociatedToggle(assoc.id, assoc.isEmergency)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer ${
                      associatedSymptoms.includes(assoc.id)
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs'
                        : 'border-slate-200/60 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                    } ${assoc.isEmergency ? 'hover:border-red-200 hover:bg-red-50/10' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      {assoc.isEmergency && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                      {assoc.label}
                    </span>
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                      associatedSymptoms.includes(assoc.id)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-250'
                    }`}>
                      {associatedSymptoms.includes(assoc.id) && <span className="text-xs font-bold">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Age Group */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800">What is the age of the patient?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {ageGroups.map((age) => (
                  <button
                    key={age.id}
                    onClick={() => setAgeGroup(age.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer ${
                      ageGroup === age.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs'
                        : 'border-slate-200/60 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-slate-400" />
                      {age.label}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold mt-4">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!ageGroup || loading}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-blue-100"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    <>
                      Generate Evaluation Report
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Report Display */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-blue-800">MediCare AI Analysis Report</h4>
                  <p className="text-[11px] font-semibold text-blue-650 mt-0.5">
                    This report has been analyzed by Gemini 2.5 Flash based on the input provided. Read the details below.
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4 border border-slate-100 rounded-2xl p-5 sm:p-6 bg-slate-50/50">
                {report.split('\n').map((line, idx) => {
                  if (line.startsWith('###')) {
                    return <h4 key={idx} className="text-base font-bold text-slate-800 mt-4 mb-2">{line.replace('###', '').trim()}</h4>;
                  }
                  if (line.startsWith('##')) {
                    return <h3 key={idx} className="text-lg font-extrabold text-slate-850 mt-5 mb-2">{line.replace('##', '').trim()}</h3>;
                  }
                  if (line.startsWith('#')) {
                    return <h2 key={idx} className="text-xl font-black text-slate-900 mt-6 mb-3">{line.replace('#', '').trim()}</h2>;
                  }
                  if (line.startsWith('-') || line.startsWith('*')) {
                    return <li key={idx} className="ml-4 list-disc marker:text-blue-500 py-0.5 font-medium">{line.substring(1).trim()}</li>;
                  }
                  if (line.trim().length === 0) return <div key={idx} className="h-2" />;
                  
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={idx} className="font-medium text-slate-600">
                      {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={pIdx} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={resetChecker}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm py-3 px-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" /> Start New Scan
                </button>
                <button
                  onClick={() => setCurrentView('doctors')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-blue-200 cursor-pointer"
                >
                  Find Specialists Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
