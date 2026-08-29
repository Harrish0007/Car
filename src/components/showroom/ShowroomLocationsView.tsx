import React from 'react';
import { ShowroomLocation } from '../../types/vehicle';
import { SHOWROOM_LOCATIONS } from '../../data/vehiclesData';
import { vehicleAudio } from '../../utils/audioSynth';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Car,
  Calendar,
  Compass,
  Sparkles,
} from 'lucide-react';

interface ShowroomLocationsViewProps {
  onBookDriveAtLocation: (loc: ShowroomLocation) => void;
}

export const ShowroomLocationsView: React.FC<ShowroomLocationsViewProps> = ({
  onBookDriveAtLocation,
}) => {
  return (
    <div id="showrooms-page" className="space-y-12 py-6 text-neutral-100">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono tracking-wider uppercase">
          <MapPin className="w-3.5 h-3.5" />
          <span>Global Experience Network</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-display text-white">
          Aether Design Studios & Private Handling Tracks
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Visit our bespoke pavilions to consult directly with Aether Master Designers, explore tactile carbon and leather material swatches, and experience dynamic circuit test drives.
        </p>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOWROOM_LOCATIONS.map(loc => (
          <div
            key={loc.id}
            className="group bg-[#0F0F0F] border border-white/10 hover:border-blue-500/40 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Image Header with Badge */}
            <div className="relative h-48 overflow-hidden bg-[#0A0A0A]">
              <img
                src={loc.image}
                alt={loc.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md text-blue-400 border border-white/10">
                  {loc.city}
                </span>
              </div>

              {loc.hasTrack && (
                <div className="absolute bottom-4 left-4">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold flex items-center gap-1 shadow-lg">
                    <span>⚡ Handling Circuit</span>
                  </span>
                </div>
              )}
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  {loc.name}
                </h3>

                <div className="space-y-2 text-xs text-neutral-400">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{loc.address}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    <span>{loc.operatingHours}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    <span className="font-mono">{loc.phone}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    <span>{loc.email}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-white/10">
                <button
                  id={`btn-loc-book-${loc.id}`}
                  onClick={() => {
                    vehicleAudio.playSelectBeep();
                    onBookDriveAtLocation(loc);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4 fill-current" />
                  <span>Reserve Test Session Here</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
