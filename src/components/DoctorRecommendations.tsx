import React, { useState, useEffect } from 'react';
import { Search, Calendar, Star, MapPin, User, CheckCircle2, Sparkles, X, Clock, HelpCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  availability: string[];
  image: string;
}

interface DoctorRecommendationsProps {
  recommendedSpecialist: string;
  clearRecommendation: () => void;
}

export const DoctorRecommendations: React.FC<DoctorRecommendationsProps> = ({ 
  recommendedSpecialist,
  clearRecommendation
}) => {
  const [filterSpecialty, setFilterSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const specialties = [
    'All',
    'General Practitioner',
    'Cardiologist',
    'Dermatologist',
    'Gastroenterologist',
    'Neurologist',
    'Pediatrician',
    'Pulmonologist',
    'Otolaryngologist (ENT)'
  ];

  const doctors: Doctor[] = [
    {
      id: 'doc1',
      name: 'Dr. Evelyn Carter',
      specialty: 'Cardiologist',
      rating: 4.9,
      reviews: 142,
      experience: '14 years',
      location: 'Metro Cardiac Center, Suite 402',
      availability: ['Monday', 'Wednesday', 'Friday'],
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'doc2',
      name: 'Dr. Marcus Vance',
      specialty: 'Dermatologist',
      rating: 4.8,
      reviews: 98,
      experience: '10 years',
      location: 'Skin Health Associates, Downtown',
      availability: ['Tuesday', 'Thursday'],
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'doc3',
      name: 'Dr. Sarah Jenkins',
      specialty: 'Gastroenterologist',
      rating: 4.7,
      reviews: 115,
      experience: '12 years',
      location: 'Digestive Wellness Clinic',
      availability: ['Monday', 'Tuesday', 'Thursday'],
      image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'doc4',
      name: 'Dr. Robert Chen',
      specialty: 'Neurologist',
      rating: 4.9,
      reviews: 87,
      experience: '16 years',
      location: 'Brain & Spine Institute, West Wing',
      availability: ['Wednesday', 'Friday'],
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'doc5',
      name: 'Dr. Alisha Patel',
      specialty: 'Pediatrician',
      rating: 4.9,
      reviews: 203,
      experience: '9 years',
      location: 'Happy Kids Pediatrics, Suite 101',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'doc6',
      name: 'Dr. David Kim',
      specialty: 'General Practitioner',
      rating: 4.7,
      reviews: 310,
      experience: '8 years',
      location: 'MediCare Family Practice, Room B',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'doc7',
      name: 'Dr. Fiona Gallagher',
      specialty: 'Pulmonologist',
      rating: 4.8,
      reviews: 64,
      experience: '15 years',
      location: 'Pulmonary Care & Sleep Center',
      availability: ['Tuesday', 'Friday'],
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'doc8',
      name: 'Dr. Samuel Birnbaum',
      specialty: 'Otolaryngologist (ENT)',
      rating: 4.6,
      reviews: 79,
      experience: '11 years',
      location: 'ENT Specialists, Suite 305',
      availability: ['Wednesday', 'Thursday'],
      image: 'https://images.unsplash.com/photo-1536064479547-7ee40b74b807?auto=format&fit=crop&q=80&w=300'
    }
  ];

  // Hook to handle recommendation injection
  useEffect(() => {
    if (recommendedSpecialist) {
      const matched = specialties.find(s => 
        recommendedSpecialist.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(recommendedSpecialist.toLowerCase())
      );
      if (matched) {
        setFilterSpecialty(matched);
      } else {
        setFilterSpecialty('All');
      }
    }
  }, [recommendedSpecialist]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      setIsBooked(true);
    }
  };

  const handleCloseBooking = () => {
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setIsBooked(false);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpecialty = filterSpecialty === 'All' || doc.specialty === filterSpecialty;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Recommended Alert Banner */}
      {recommendedSpecialist && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 animate-scale-up">
          <div className="flex gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Specialist Recommended</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-semibold">
                Based on your symptom report, we have pre-filtered our directory for: <span className="text-blue-600 font-extrabold">{recommendedSpecialist}</span>.
              </p>
            </div>
          </div>
          <button 
            onClick={clearRecommendation}
            className="text-slate-400 hover:text-slate-700 bg-white border border-slate-100 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Directory Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search doctors, clinic, specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-850 bg-white shadow-xs"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Specialty Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => {
                setFilterSpecialty(spec);
                if (recommendedSpecialist && spec !== recommendedSpecialist) {
                  clearRecommendation();
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                filterSpecialty === spec
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60 shadow-2xs'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Listings Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row gap-5 shadow-xs hover:shadow-md hover:border-slate-200/60 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Doctor Photo */}
              <div className="w-full sm:w-32 h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100 shadow-inner relative">
                {doc.image ? (
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-350">
                    <User className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md border border-slate-100 rounded-lg px-1.5 py-0.5 text-[10px] font-black text-blue-600 flex items-center gap-0.5 shadow-sm">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{doc.rating}</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100/30">
                    {doc.specialty}
                  </span>
                  <h4 className="text-lg font-bold text-slate-800 mt-1">{doc.name}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-450 font-semibold mt-1">
                    <span>Exp: {doc.experience}</span>
                    <span>•</span>
                    <span>{doc.reviews} Reviews</span>
                  </div>
                  <div className="flex items-start gap-1 text-xs text-slate-500 font-medium mt-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-455 shrink-0 mt-0.5" />
                    <span>{doc.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-50">
                  <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Availability: {doc.availability.join(', ')}</span>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-100 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Book Appt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400">
          <HelpCircle className="h-12 w-12 text-slate-355 mx-auto mb-2" />
          <h4 className="text-slate-700 font-bold">No Specialists Found</h4>
          <p className="text-xs font-semibold text-slate-450 mt-1">Try expanding your search parameters or selecting another specialty filter.</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up relative">
            <button
              onClick={handleCloseBooking}
              className="absolute right-4 top-4 text-slate-450 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {!isBooked ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-xl font-bold text-slate-800">Schedule Appointment</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Book a session with your recommended practitioner.</p>
                </div>

                <div className="flex gap-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 items-center">
                  <img 
                    src={selectedDoctor.image} 
                    alt={selectedDoctor.name} 
                    className="w-12 h-12 object-cover rounded-xl border border-white"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{selectedDoctor.name}</h4>
                    <p className="text-xs text-blue-600 font-semibold">{selectedDoctor.specialty}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Appointment Day</label>
                  <select 
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-700 bg-white"
                  >
                    <option value="">-- Choose a Day --</option>
                    {selectedDoctor.availability.map((day) => (
                      <option key={day} value={day}>{day} (Next available)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Time Slot</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          selectedTime === time
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200/70 hover:border-blue-200 text-slate-655 hover:bg-slate-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                >
                  <Calendar className="h-4 w-4" /> Confirm Schedule (Simulated)
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4 animate-scale-up">
                <div className="inline-flex bg-emerald-100 text-emerald-600 p-4 rounded-full">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Booking Confirmed!</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Your appointment with <span className="font-extrabold text-slate-700">{selectedDoctor.name}</span> has been simulated.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-left text-xs font-semibold text-slate-600 space-y-1">
                  <div><strong>Practitioner:</strong> {selectedDoctor.name} ({selectedDoctor.specialty})</div>
                  <div><strong>Scheduled Day:</strong> {selectedDate}</div>
                  <div><strong>Scheduled Time:</strong> {selectedTime}</div>
                  <div><strong>Location:</strong> {selectedDoctor.location}</div>
                </div>

                <button
                  onClick={handleCloseBooking}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
