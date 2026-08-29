import React, { useState } from 'react';
import { vehicleAudio } from '../../utils/audioSynth';
import {
  Compass,
  Sliders,
  DollarSign,
  Calendar,
  Bookmark,
  MapPin,
  Menu,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  activeView: 'configurator' | 'showcase' | 'calculator' | 'scheduling' | 'locations';
  onNavigate: (view: 'configurator' | 'showcase' | 'calculator' | 'scheduling' | 'locations') => void;
  onOpenGarage: () => void;
  savedBuildsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onOpenGarage,
  savedBuildsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(vehicleAudio.getMuted());

  const navItems = [
    { id: 'configurator', label: '3D Configurator', icon: Sliders },
    { id: 'showcase', label: 'Fleet Lineup', icon: Compass },
    { id: 'calculator', label: 'Finance & Lease', icon: DollarSign },
    { id: 'scheduling', label: 'Test Drive', icon: Calendar },
    { id: 'locations', label: 'Showrooms', icon: MapPin },
  ] as const;

  const handleNavClick = (view: typeof activeView) => {
    vehicleAudio.playSelectBeep();
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleToggleMute = () => {
    const muted = vehicleAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('configurator')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="font-display text-lg tracking-tighter">Æ</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display font-extrabold text-xl tracking-wider text-[#F0F0F0]">
              <span>AETHER</span>
              <span className="text-blue-400 text-xs font-mono font-normal px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                STUDIO
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase -mt-0.5">
              Automotive Engineering
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121212] p-1.5 rounded-2xl border border-white/10">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-extrabold'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA Area: Garage, Audio & Quick Action */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Audio FX Mute */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2.5 rounded-xl bg-[#121212] hover:bg-[#1C1C1C] text-neutral-300 hover:text-white border border-white/10 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
          </button>

          {/* Garage Saved Builds */}
          <button
            id="btn-header-garage"
            onClick={() => {
              vehicleAudio.playSelectBeep();
              onOpenGarage();
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#121212] hover:bg-[#1C1C1C] border border-white/10 text-neutral-200 hover:text-white text-xs font-bold transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Garage</span>
            {savedBuildsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                {savedBuildsCount}
              </span>
            )}
          </button>

          {/* Schedule VIP Drive CTA */}
          <button
            id="btn-header-drive"
            onClick={() => handleNavClick('scheduling')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-extrabold shadow-lg shadow-blue-600/25 transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Book Test Drive</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-[#121212] text-neutral-300 hover:text-white border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-[#0A0A0A] border-b border-white/10 space-y-2 animate-in fade-in duration-150">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-300 hover:bg-[#121212]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              onClick={() => {
                onOpenGarage();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#121212] border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-blue-400" />
              <span>Saved Garage ({savedBuildsCount})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
