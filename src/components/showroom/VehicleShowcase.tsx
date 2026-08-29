import React from 'react';
import { VehicleModel } from '../../types/vehicle';
import { vehicleAudio } from '../../utils/audioSynth';
import {
  Zap,
  Gauge,
  BatteryCharging,
  Shield,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  Cpu,
  Wind,
} from 'lucide-react';

interface VehicleShowcaseProps {
  models: VehicleModel[];
  onSelectAndConfigure: (modelId: string) => void;
  onBookTestDrive: (modelId: string) => void;
}

export const VehicleShowcase: React.FC<VehicleShowcaseProps> = ({
  models,
  onSelectAndConfigure,
  onBookTestDrive,
}) => {
  return (
    <div id="vehicle-showcase-section" className="space-y-16 py-8 text-neutral-100">
      {/* 1. Engineering Philosophy Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0F0F0F] border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Automotive Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Crafted for Velocity. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-500">
              Engineered for the Infinite.
            </span>
          </h2>

          <p className="text-base text-neutral-300 leading-relaxed">
            Aether vehicles merge lightweight carbon-monocoque composites with bespoke 900V tri-motor powertrains and active downforce aerodynamics. Each vehicle is tailored to individual specification in our high-precision studio.
          </p>

          {/* Quick Specs Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">1,200 HP</div>
              <div className="text-xs text-neutral-400 uppercase font-mono mt-1">Tri-Motor Output</div>
            </div>
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">1.98s</div>
              <div className="text-xs text-neutral-400 uppercase font-mono mt-1">0-60 MPH Acceleration</div>
            </div>
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">435 mi</div>
              <div className="text-xs text-neutral-400 uppercase font-mono mt-1">EPA Estimated Range</div>
            </div>
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">900V</div>
              <div className="text-xs text-neutral-400 uppercase font-mono mt-1">Ultra-Fast Charging</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full Fleet Model Lineup Comparison */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-400">
            Current Production Fleet
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Explore the Aether Lineup
          </h3>
          <p className="text-xs text-neutral-400">
            Select any vehicle to launch the real-time 3D configurator, customize bespoke trims, or schedule a circuit test drive.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {models.map(model => (
            <div
              key={model.id}
              className="group bg-[#0F0F0F] border border-white/10 hover:border-blue-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-semibold">
                    {model.category}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    From ${model.basePrice.toLocaleString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {model.name}
                  </h4>
                  <p className="text-xs text-blue-400/90 font-medium mt-0.5">{model.tagline}</p>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">{model.description}</p>

                {/* Tech Specs Matrix */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-[#0A0A0A] rounded-2xl border border-white/10 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">Power</div>
                    <div className="font-bold text-white">{model.specs.horsepower} Horsepower</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">0-60 MPH</div>
                    <div className="font-bold text-blue-400">{model.specs.acceleration060} Seconds</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">Top Speed</div>
                    <div className="font-bold text-white">{model.specs.topSpeedMph} MPH</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">Range / Battery</div>
                    <div className="font-bold text-white">
                      {model.specs.rangeMiles} mi ({model.specs.batteryKwh ? `${model.specs.batteryKwh} kWh` : model.specs.engineDisplacement})
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-white/10 grid grid-cols-2 gap-2">
                <button
                  id={`showcase-configure-${model.id}`}
                  onClick={() => {
                    vehicleAudio.playSelectBeep();
                    onSelectAndConfigure(model.id);
                  }}
                  className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                >
                  <span>3D Configurator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id={`showcase-testdrive-${model.id}`}
                  onClick={() => {
                    vehicleAudio.playSelectBeep();
                    onBookTestDrive(model.id);
                  }}
                  className="py-3 px-3 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-200 font-semibold text-xs transition-colors"
                >
                  Book Drive
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Technology & Innovation Pillars */}
      <div className="rounded-3xl bg-[#0A0A0A] border border-white/10 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-400">
            Aether Technological Innovations
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Pioneering the Next Era of Performance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#121212] rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Tri-Motor Torque Vectoring</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Real-time torque calculation per millisecond on each individual wheel provides surgical cornering accuracy, zero understeer, and instant power delivery.
            </p>
          </div>

          <div className="p-6 bg-[#121212] rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Wind className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Active Aerodynamic Kinematics</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Electronically modulated front intake shutters and high-speed hydraulic rear airfoils generate up to 950 lbs of downforce without creating parasitic straight-line drag.
            </p>
          </div>

          <div className="p-6 bg-[#121212] rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">900V Ultra-Fast Thermals</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Silicon carbide inverters paired with submerged direct-dielectric cell cooling enable 350kW DC rapid charging, adding 250 miles of range in under 12 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
