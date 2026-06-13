import React, { useState } from 'react';
import { Salad, Moon, Heart, Dumbbell, ShieldCheck, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

interface Tip {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  bgClass: string;
  borderColor: string;
}

export const HealthTips: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const categories = [
    { id: 'all', label: 'All Tips' },
    { id: 'nutrition', label: 'Nutrition', icon: <Salad className="h-4 w-4" /> },
    { id: 'sleep', label: 'Sleep & Rest', icon: <Moon className="h-4 w-4" /> },
    { id: 'exercise', label: 'Exercise', icon: <Dumbbell className="h-4 w-4" /> },
    { id: 'mental', label: 'Mental Wellness', icon: <Heart className="h-4 w-4" /> },
    { id: 'preventive', label: 'Preventive Care', icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  const tips: Tip[] = [
    {
      title: 'Prioritize Whole Foods',
      description: 'Fill 70% of your plate with vegetables, fruits, whole grains, and lean proteins. These provide essential micronutrients and antioxidants to support natural cellular repair.',
      icon: <Salad className="h-6 w-6" />,
      category: 'nutrition',
      color: 'text-emerald-600',
      bgClass: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Maintain a Consistent Sleep Cycle',
      description: 'Go to bed and wake up at the same time every day, even on weekends. Consistent timing anchors your circadian rhythm, optimizing cognitive and metabolic health.',
      icon: <Moon className="h-6 w-6" />,
      category: 'sleep',
      color: 'text-indigo-600',
      bgClass: 'bg-indigo-50/70',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Aim for 150 Minutes of Moderate Exercise',
      description: 'Perform at least 150 minutes of moderate-intensity aerobic exercise (like brisk walking) or 75 minutes of vigorous exercise weekly, combined with strength training twice a week.',
      icon: <Dumbbell className="h-6 w-6" />,
      category: 'exercise',
      color: 'text-blue-600',
      bgClass: 'bg-blue-50/70',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Practice Box Breathing for Stress Management',
      description: 'Inhale for 4 seconds, hold for 4, exhale for 4, and hold for 4. This activates the parasympathetic nervous system, lowering your heart rate and cortisol levels.',
      icon: <Heart className="h-6 w-6" />,
      category: 'mental',
      color: 'text-rose-600',
      bgClass: 'bg-rose-50/70',
      borderColor: 'border-rose-100',
    },
    {
      title: 'Keep Up with Routine Screenings',
      description: 'Schedule annual checkups and routine blood panels (lipids, glucose, vitamin levels). Early detection of subtle physiological shifts is the cornerstone of preventive longevity.',
      icon: <ShieldCheck className="h-6 w-6" />,
      category: 'preventive',
      color: 'text-cyan-600',
      bgClass: 'bg-cyan-50/70',
      borderColor: 'border-cyan-100',
    },
    {
      title: 'Optimize Your Hydration',
      description: 'Drink approximately 2 to 3 liters of water daily. Hydration is vital for joint lubrication, temperature regulation, nutrient delivery, and renal function.',
      icon: <Salad className="h-6 w-6" />,
      category: 'nutrition',
      color: 'text-emerald-600',
      bgClass: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Establish a Digital Sunset',
      description: 'Turn off screens 60 minutes before bedtime. Blue light inhibits melatonin secretion, which prevents deep, restorative slow-wave and REM sleep phases.',
      icon: <Moon className="h-6 w-6" />,
      category: 'sleep',
      color: 'text-indigo-600',
      bgClass: 'bg-indigo-50/70',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Take Micro-Breaks at Desk Work',
      description: 'Follow the 20-20-20 rule: every 20 minutes, look at an object 20 feet away for 20 seconds. Stand up and stretch for 2 minutes to restore blood circulation.',
      icon: <Dumbbell className="h-6 w-6" />,
      category: 'exercise',
      color: 'text-blue-600',
      bgClass: 'bg-blue-50/70',
      borderColor: 'border-blue-100',
    },
  ];

  const filteredTips = activeCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === activeCategory);

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTips.length);
  };

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
  };

  // Reset index if category changes
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Tip Card Carousel */}
      {filteredTips.length > 0 ? (
        <div className="relative">
          {/* Main Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border ${filteredTips[currentIndex].borderColor} ${filteredTips[currentIndex].bgClass} transition-all duration-300 relative overflow-hidden shadow-xs`}>
            {/* Background design elements */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-slate-900 pointer-events-none scale-150">
              {filteredTips[currentIndex].icon}
            </div>
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-100 ${filteredTips[currentIndex].color} shrink-0`}>
                {filteredTips[currentIndex].icon}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/85 border ${filteredTips[currentIndex].borderColor} ${filteredTips[currentIndex].color}`}>
                    {filteredTips[currentIndex].category}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5 text-yellow-500 animate-bounce" />
                    Daily Health Insight
                  </span>
                </div>
                <h4 className="text-xl font-bold text-slate-850 tracking-tight">
                  {filteredTips[currentIndex].title}
                </h4>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-semibold">
                  {filteredTips[currentIndex].description}
                </p>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Buttons */}
          {filteredTips.length > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <span className="text-xs font-bold text-slate-405">
                Tip {currentIndex + 1} of {filteredTips.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevTip}
                  className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-600 p-2 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextTip}
                  className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-600 p-2 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-center text-slate-500 font-semibold">
          No tips found for this category.
        </div>
      )}
    </div>
  );
};
