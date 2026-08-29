import React, { useState, useEffect } from 'react';
import {
  VehicleModel,
  VehicleConfiguration,
  ShowroomLocation,
  TestDriveAppointment,
} from '../../types/vehicle';
import { SHOWROOM_LOCATIONS } from '../../data/vehiclesData';
import { vehicleAudio } from '../../utils/audioSynth';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Car,
  User,
  Phone,
  Mail,
  Shield,
  Sparkles,
  ArrowRight,
  Download,
  Share2,
  Trash2,
  Check,
  Compass,
} from 'lucide-react';

interface TestDriveSchedulerProps {
  models: VehicleModel[];
  selectedModel: VehicleModel;
  config: VehicleConfiguration;
  totalPrice: number;
  onSelectModel: (modelId: string) => void;
  onClose?: () => void;
}

export const TestDriveScheduler: React.FC<TestDriveSchedulerProps> = ({
  models,
  selectedModel,
  config,
  totalPrice,
  onSelectModel,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<ShowroomLocation>(
    SHOWROOM_LOCATIONS[0]
  );
  const [experienceType, setExperienceType] = useState<'track' | 'road' | 'concierge-home'>('track');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:00 AM');
  const [preferredTuning, setPreferredTuning] = useState<
    'Comfort & Luxury' | 'Sport Plus' | 'Track Extreme'
  >('Sport Plus');

  // Customer Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState<string>('');
  const [homeDeliveryAddress, setHomeDeliveryAddress] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Confirmed Appointment state
  const [confirmedBooking, setConfirmedBooking] = useState<TestDriveAppointment | null>(null);
  const [savedAppointments, setSavedAppointments] = useState<TestDriveAppointment[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'saved'>('wizard');

  // Load saved appointments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aether_test_drives');
      if (stored) {
        setSavedAppointments(JSON.parse(stored));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Generate next 14 dates for appointment picking
  const availableDates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      monthDay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].iso);
    }
  }, [availableDates, selectedDate]);

  const timeSlots = [
    { time: '09:30 AM', label: 'Morning Track Calibration', icon: '🌅' },
    { time: '11:00 AM', label: 'Technical Handling Course', icon: '🏎️' },
    { time: '01:30 PM', label: 'Midday High-Speed Autopilot', icon: '⚡' },
    { time: '03:30 PM', label: 'Launch Control Demonstration', icon: '🚀' },
    { time: '05:30 PM', label: 'Golden Hour Dynamic Tour', icon: '🌇' },
    { time: '07:00 PM', label: 'Twilight LED Matrix Experience', icon: '✨' },
  ];

  // Submit test drive booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vehicleAudio.playSelectBeep();

    const newAppointment: TestDriveAppointment = {
      id: `AETH-TD-${Math.floor(100000 + Math.random() * 900000)}`,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      configurationSummary: `${config.finishType.toUpperCase()} Paint, ${config.wheelId.replace('wheel-', '')}, ${selectedModel.specs.horsepower} HP`,
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      experienceType,
      customerName,
      email: customerEmail,
      phone: customerPhone,
      driverLicenseNumber,
      homeDeliveryAddress: experienceType === 'concierge-home' ? homeDeliveryAddress : undefined,
      preferredTuning,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      estimatedPrice: totalPrice,
    };

    const updated = [newAppointment, ...savedAppointments];
    setSavedAppointments(updated);
    try {
      localStorage.setItem('aether_test_drives', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setConfirmedBooking(newAppointment);
    setCurrentStep(5);

    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
    });
  };

  // Cancel saved appointment
  const handleCancelAppointment = (id: string) => {
    vehicleAudio.playSelectBeep();
    const filtered = savedAppointments.filter(a => a.id !== id);
    setSavedAppointments(filtered);
    try {
      localStorage.setItem('aether_test_drives', JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  };

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = (apt: TestDriveAppointment) => {
    const title = encodeURIComponent(`Aether Motors VIP Test Drive: ${apt.modelName}`);
    const details = encodeURIComponent(
      `Appointment Ref: ${apt.id}\nVehicle: ${apt.modelName} (${apt.configurationSummary})\nLocation: ${apt.locationName}\nTuning: ${apt.preferredTuning}`
    );
    const location = encodeURIComponent(apt.locationName);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div
      id="test-drive-scheduler"
      className="bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-neutral-100"
    >
      {/* 1. Top Bar */}
      <div className="p-5 bg-[#0A0A0A] border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
            <Car className="w-4 h-4" />
            <span>Aether Experience Concierge</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <span>Schedule Private Test Drive</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
              VIP Track Access
            </span>
          </h2>
        </div>

        {/* View Switcher: New Booking vs Saved Bookings */}
        <div className="flex items-center bg-[#121212] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'wizard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            New Reservation
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>My Bookings</span>
            {savedAppointments.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#1C1C1C] text-blue-400 text-[10px] flex items-center justify-center font-mono border border-white/10">
                {savedAppointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'wizard' ? (
        <div>
          {/* Step Progress Indicators */}
          {currentStep < 5 && (
            <div className="px-6 py-3 bg-[#0A0A0A]/80 border-b border-white/10 flex items-center justify-between overflow-x-auto no-scrollbar">
              {[
                { step: 1, label: 'Vehicle' },
                { step: 2, label: 'Location' },
                { step: 3, label: 'Date & Time' },
                { step: 4, label: 'Driver Details' },
              ].map(s => (
                <div
                  key={s.step}
                  className={`flex items-center gap-2 text-xs font-medium ${
                    currentStep === s.step
                      ? 'text-blue-400 font-bold'
                      : currentStep > s.step
                      ? 'text-emerald-400'
                      : 'text-neutral-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono border ${
                      currentStep === s.step
                        ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                        : currentStep > s.step
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-white/10 bg-[#121212] text-neutral-500'
                    }`}
                  >
                    {currentStep > s.step ? '✓' : s.step}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            {/* STEP 1: VEHICLE MODEL SELECTION & SUMMARY */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Confirm Vehicle for Test Drive
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Your current 3D bespoke configuration will be prepared for the drive.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {models.map(m => {
                    const isSelected = m.id === selectedModel.id;
                    return (
                      <div
                        key={m.id}
                        id={`td-model-${m.id}`}
                        onClick={() => {
                          vehicleAudio.playSelectBeep();
                          onSelectModel(m.id);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30 shadow-xl'
                            : 'border-white/10 bg-[#0A0A0A] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                            {m.category}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">{m.name}</h4>
                        <p className="text-xs text-neutral-400 mb-3">{m.tagline}</p>

                        <div className="grid grid-cols-3 gap-1 pt-3 border-t border-white/10 text-center">
                          <div>
                            <div className="text-[10px] text-neutral-500">POWER</div>
                            <div className="text-xs font-bold font-mono text-white">
                              {m.specs.horsepower} HP
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-neutral-500">0-60 MPH</div>
                            <div className="text-xs font-bold font-mono text-blue-400">
                              {m.specs.acceleration060}s
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-neutral-500">RANGE</div>
                            <div className="text-xs font-bold font-mono text-white">
                              {m.specs.rangeMiles} mi
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Experience Format Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    Select Test Drive Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'track',
                        title: 'Private Circuit Experience',
                        desc: 'Closed-course high-speed dynamic track with professional instructor coaching.',
                        badge: 'Recommended',
                      },
                      {
                        id: 'road',
                        title: 'Scenic Coastal / Canyon Route',
                        desc: '60-minute real-world highway & winding canyon performance test.',
                        badge: 'Popular',
                      },
                      {
                        id: 'concierge-home',
                        title: 'VIP Home / Office Delivery',
                        desc: 'Vehicle brought directly to your residence with an Aether Product Specialist.',
                        badge: 'Executive',
                      },
                    ].map(exp => (
                      <div
                        key={exp.id}
                        onClick={() => {
                          vehicleAudio.playSelectBeep();
                          setExperienceType(exp.id as any);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          experienceType === exp.id
                            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                            : 'border-white/10 bg-[#0A0A0A]/60 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{exp.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-blue-300">
                            {exp.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">{exp.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    id="btn-step1-next"
                    onClick={() => {
                      vehicleAudio.playSelectBeep();
                      setCurrentStep(2);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <span>Proceed to Location Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SHOWROOM & EXPERIENCE CENTER */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Select Aether Experience Center
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Choose a global flagship center equipped with private handling circuits and charging lounges.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SHOWROOM_LOCATIONS.map(loc => {
                    const isSelected = loc.id === selectedLocation.id;
                    return (
                      <div
                        key={loc.id}
                        id={`loc-${loc.id}`}
                        onClick={() => {
                          vehicleAudio.playSelectBeep();
                          setSelectedLocation(loc);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                            : 'border-white/10 bg-[#0A0A0A] hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white">{loc.name}</h4>
                              <div className="text-xs text-blue-400 font-medium">{loc.city}</div>
                            </div>
                            {loc.hasTrack && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1 border border-emerald-500/30">
                                <span>Track Circuit</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                            <span className="truncate">{loc.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <Clock className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                            <span>{loc.operatingHours}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
                          <span>{loc.phone}</span>
                          <span className="text-blue-400">
                            {isSelected ? '✓ Selected Hub' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    id="btn-step2-next"
                    onClick={() => {
                      vehicleAudio.playSelectBeep();
                      setCurrentStep(3);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <span>Select Date & Time</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DATE & TIME SLOT PICKER */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Select Test Drive Appointment Slot
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Location: {selectedLocation.name} ({selectedLocation.city})
                  </p>
                </div>

                {/* Date Slider */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    Available Dates (Next 10 Days)
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {availableDates.map(d => {
                      const isSelected = selectedDate === d.iso;
                      return (
                        <button
                          key={d.iso}
                          id={`date-${d.iso}`}
                          onClick={() => {
                            vehicleAudio.playSelectBeep();
                            setSelectedDate(d.iso);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                              : 'border-white/10 bg-[#0A0A0A] text-neutral-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="text-[10px] uppercase font-mono opacity-80">{d.dayName}</div>
                          <div className="text-xs font-bold mt-0.5">{d.monthDay.split(' ')[1]}</div>
                          <div className="text-[9px] opacity-70">{d.monthDay.split(' ')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    Select VIP Experience Session
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {timeSlots.map(slot => {
                      const isSelected = selectedTimeSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          id={`timeslot-${slot.time.replace(/\s|:/g, '')}`}
                          onClick={() => {
                            vehicleAudio.playSelectBeep();
                            setSelectedTimeSlot(slot.time);
                          }}
                          className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                              : 'border-white/10 bg-[#0A0A0A] hover:border-white/20'
                          }`}
                        >
                          <span className="text-xl">{slot.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white flex items-center justify-between">
                              <span>{slot.time}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate">{slot.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Powertrain Dynamics Preference */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                    Preferred Chassis Tuning for Test Session
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Comfort & Luxury', 'Sport Plus', 'Track Extreme'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          vehicleAudio.playSelectBeep();
                          setPreferredTuning(mode);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                          preferredTuning === mode
                            ? 'border-blue-500 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500'
                            : 'border-white/10 bg-[#0A0A0A] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    id="btn-step3-next"
                    onClick={() => {
                      vehicleAudio.playSelectBeep();
                      setCurrentStep(4);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <span>Enter Driver Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DRIVER DETAILS FORM */}
            {currentStep === 4 && (
              <form onSubmit={handleBookingSubmit} className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Driver Credentials & VIP Contact
                  </h3>
                  <p className="text-xs text-neutral-400">
                    A valid driver&apos;s license is required upon check-in. Insurance coverage is complimentary.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sterling Hayes"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="sterling@example.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">
                      Mobile Phone (for SMS Reminders) *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+1 (555) 019-2831"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">
                      Driver&apos;s License Number / State *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. CA-D8392102"
                      value={driverLicenseNumber}
                      onChange={e => setDriverLicenseNumber(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {experienceType === 'concierge-home' && (
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">
                      Home / Executive Office Delivery Address *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Street address, City, State, ZIP"
                      value={homeDeliveryAddress}
                      onChange={e => setHomeDeliveryAddress(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">
                    Special Requests / Hospitality Preferences (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Interested in comparing with Porsche Taycan / Ferrari 296, coffee preference, telemetry recording."
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Summary Box */}
                <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-neutral-400">Selected Vehicle & Slot</div>
                    <div className="font-bold text-white">
                      {selectedModel.name} on {selectedDate} at {selectedTimeSlot}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-neutral-400">Hub</div>
                    <div className="font-bold text-blue-400">{selectedLocation.name}</div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    id="btn-submit-booking"
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-xs shadow-xl shadow-blue-600/25 transition-all"
                  >
                    <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirm & Generate VIP Pass</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5: CONFIRMATION VOUCHER & DIGITAL PASS */}
            {currentStep === 5 && confirmedBooking && (
              <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
                    Reservation Confirmed
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Your Aether Experience Pass is Ready
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    A confirmation packet has been dispatched to {confirmedBooking.email}.
                  </p>
                </div>

                {/* VIP Boarding Pass Card */}
                <div className="max-w-lg mx-auto bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl text-left space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">EXPERIENCE PASS ID</div>
                      <div className="text-base font-mono font-bold text-blue-400">
                        {confirmedBooking.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">STATUS</div>
                      <div className="text-xs font-bold text-emerald-400">Confirmed VIP</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">DRIVER</div>
                      <div className="text-sm font-bold text-white">{confirmedBooking.customerName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">VEHICLE</div>
                      <div className="text-sm font-bold text-white">{confirmedBooking.modelName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">DATE & TIME</div>
                      <div className="text-sm font-bold text-blue-300">
                        {confirmedBooking.date} @ {confirmedBooking.timeSlot}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">LOCATION</div>
                      <div className="text-sm font-bold text-white truncate">
                        {confirmedBooking.locationName}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Tuning: {confirmedBooking.preferredTuning}</span>
                    <span>Complimentary Concierge</span>
                  </div>
                </div>

                {/* Calendar & Share Actions */}
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={getGoogleCalendarUrl(confirmedBooking)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-white text-xs font-semibold transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Add to Google Calendar</span>
                  </a>

                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setActiveTab('saved');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-colors"
                  >
                    <span>View All Saved Reservations</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SAVED BOOKINGS TAB */
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Your Scheduled Reservations</h3>
            <button
              onClick={() => {
                setCurrentStep(1);
                setActiveTab('wizard');
              }}
              className="text-xs text-blue-400 font-bold hover:underline"
            >
              + Book Another Test Drive
            </button>
          </div>

          {savedAppointments.length === 0 ? (
            <div className="p-8 text-center bg-[#0A0A0A] rounded-xl border border-white/10 space-y-3">
              <Calendar className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400">No scheduled test drives on file.</p>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setActiveTab('wizard');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/25"
              >
                Schedule Your First Drive
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{apt.modelName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {apt.id}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-300">
                      📅 {apt.date} at {apt.timeSlot} · 📍 {apt.locationName}
                    </div>
                    <div className="text-[11px] text-neutral-500">Driver: {apt.customerName} ({apt.email})</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getGoogleCalendarUrl(apt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-xs text-white"
                    >
                      Calendar
                    </a>
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="p-2 rounded-lg bg-[#18181B] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/10 transition-colors"
                      title="Cancel Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
