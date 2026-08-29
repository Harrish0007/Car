import React, { useState } from 'react';
import {
  VehicleConfiguration,
  VehicleModel,
  PaintColor,
  PaintFinish,
  WheelOption,
  CaliperOption,
  AeroPackage,
  RoofOption,
  InteriorOption,
  PerformancePackage,
} from '../../types/vehicle';
import { vehicleAudio } from '../../utils/audioSynth';
import {
  Palette,
  Disc,
  Armchair,
  Sparkles,
  Sliders,
  Check,
  Zap,
  Eye,
  Layers,
  ChevronRight,
  Bookmark,
  Share2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Flame,
  CircleDot,
} from 'lucide-react';

interface ConfiguratorPanelProps {
  models: VehicleModel[];
  selectedModel: VehicleModel;
  config: VehicleConfiguration;
  onSelectModel: (modelId: string) => void;
  onUpdateConfig: (partial: Partial<VehicleConfiguration>) => void;
  onBookTestDrive: () => void;
  onOpenCalculator: () => void;
  onSaveBuild: () => void;
}

type TabType = 'exterior' | 'wheels' | 'interior' | 'packages' | 'controls';

export const ConfiguratorPanel: React.FC<ConfiguratorPanelProps> = ({
  models,
  selectedModel,
  config,
  onSelectModel,
  onUpdateConfig,
  onBookTestDrive,
  onOpenCalculator,
  onSaveBuild,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('exterior');
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // Calculate pricing breakdown
  const activeColor =
    selectedModel.availableColors.find(c => c.id === config.colorId) ||
    selectedModel.availableColors[0];
  const activeWheel =
    selectedModel.availableWheels.find(w => w.id === config.wheelId) ||
    selectedModel.availableWheels[0];
  const activeWheelFinish =
    activeWheel.finishes.find(f => f.id === config.wheelFinishId) || activeWheel.finishes[0];
  const activeCaliper =
    selectedModel.availableCalipers.find(c => c.id === config.caliperColorId) ||
    selectedModel.availableCalipers[0];
  const activeAero =
    selectedModel.availableAero.find(a => a.id === config.aeroPackageId) ||
    selectedModel.availableAero[0];
  const activeRoof =
    selectedModel.availableRoofs.find(r => r.id === config.roofId) ||
    selectedModel.availableRoofs[0];
  const activeInterior =
    selectedModel.availableInteriors.find(i => i.id === config.interiorId) ||
    selectedModel.availableInteriors[0];

  const activePackages = selectedModel.availablePackages.filter(p =>
    config.packageIds.includes(p.id)
  );

  const optionsTotal =
    (activeColor?.price || 0) +
    (activeWheel?.price || 0) +
    (activeWheelFinish?.price || 0) +
    (activeCaliper?.price || 0) +
    (activeAero?.price || 0) +
    (activeRoof?.price || 0) +
    (activeInterior?.price || 0) +
    activePackages.reduce((sum, p) => sum + p.price, 0);

  const totalPrice = selectedModel.basePrice + optionsTotal;

  // Toggle package selection
  const handleTogglePackage = (pkgId: string) => {
    vehicleAudio.playSelectBeep();
    const newPackages = config.packageIds.includes(pkgId)
      ? config.packageIds.filter(id => id !== pkgId)
      : [...config.packageIds, pkgId];
    onUpdateConfig({ packageIds: newPackages });
  };

  return (
    <div
      id="configurator-panel"
      className="flex flex-col h-full bg-[#0F0F0F] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* 1. Top Bar: Model Selector Dropdown & Category */}
      <div className="p-4 border-b border-white/10 bg-[#0A0A0A]">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aether Bespoke Studio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-save-build-quick"
              onClick={() => {
                vehicleAudio.playSelectBeep();
                onSaveBuild();
              }}
              title="Save Configuration to Garage"
              className="p-1.5 rounded-lg text-xs bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-300 hover:text-white transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Model Switcher Buttons */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#121212] p-1 rounded-xl border border-white/10">
          {models.map(m => (
            <button
              key={m.id}
              id={`model-select-${m.id}`}
              onClick={() => {
                vehicleAudio.playSelectBeep();
                onSelectModel(m.id);
              }}
              className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all ${
                selectedModel.id === m.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <div className="truncate">{m.name.replace('Aether ', '')}</div>
              <div className="text-[10px] opacity-75 font-mono">
                ${(m.basePrice / 1000).toFixed(0)}k
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center border-b border-white/10 bg-[#0A0A0A]/50 overflow-x-auto no-scrollbar">
        {(
          [
            { id: 'exterior', label: 'Exterior', icon: Palette },
            { id: 'wheels', label: 'Wheels & Brakes', icon: Disc },
            { id: 'interior', label: 'Interior', icon: Armchair },
            { id: 'packages', label: 'Packages', icon: Sparkles },
            { id: 'controls', label: 'Vehicle Controls', icon: Sliders },
          ] as const
        ).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`config-tab-${tab.id}`}
              onClick={() => {
                vehicleAudio.playSelectBeep();
                setActiveTab(tab.id);
              }}
              className={`flex-1 min-w-[90px] py-3 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Configurator Options Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ================= EXTERIOR TAB ================= */}
        {activeTab === 'exterior' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Paint Finish Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Paint Chemistry & Finish
                </label>
                <span className="text-xs text-blue-400 font-medium capitalize">
                  {config.finishType}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 bg-[#0A0A0A] p-1 rounded-xl border border-white/10">
                {(['metallic', 'gloss', 'matte', 'iridescent'] as PaintFinish[]).map(finish => (
                  <button
                    key={finish}
                    id={`finish-${finish}`}
                    onClick={() => {
                      vehicleAudio.playSelectBeep();
                      onUpdateConfig({ finishType: finish });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      config.finishType === finish
                        ? 'bg-blue-600 text-white font-bold shadow'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>

            {/* Paint Colors Swatches */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Bespoke Body Color
                </label>
                <div className="text-xs font-semibold text-neutral-200">
                  {activeColor.name} {activeColor.price > 0 && `(+$${activeColor.price.toLocaleString()})`}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {selectedModel.availableColors.map(color => {
                  const isSelected = color.id === config.colorId;
                  return (
                    <button
                      key={color.id}
                      id={`color-${color.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onUpdateConfig({ colorId: color.id });
                      }}
                      className={`group relative p-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/40 shadow-lg'
                          : 'border-white/10 bg-[#0A0A0A]/60 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full shadow-inner border border-white/20 relative flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: color.hex,
                          boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.6), inset 2px 2px 6px rgba(255,255,255,0.4)`,
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                      </div>
                      <span className="text-[11px] font-medium text-neutral-300 text-center leading-tight truncate w-full">
                        {color.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {color.price === 0 ? 'Included' : `+$${color.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Roof & Canopy Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Roof & Glass Structure
              </label>
              <div className="space-y-2">
                {selectedModel.availableRoofs.map(roof => {
                  const isSelected = roof.id === config.roofId;
                  return (
                    <div
                      key={roof.id}
                      id={`roof-${roof.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onUpdateConfig({ roofId: roof.id });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-[#0A0A0A]/40 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{roof.name}</span>
                          {roof.material === 'carbon-weave' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-blue-300 font-mono">
                              Weight -18 lbs
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400">{roof.description}</p>
                      </div>
                      <div className="text-xs font-mono font-bold text-neutral-200">
                        {roof.price === 0 ? 'Included' : `+$${roof.price.toLocaleString()}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aerodynamics Package */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Aerodynamics Package
              </label>
              <div className="space-y-2">
                {selectedModel.availableAero.map(aero => {
                  const isSelected = aero.id === config.aeroPackageId;
                  return (
                    <div
                      key={aero.id}
                      id={`aero-${aero.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onUpdateConfig({ aeroPackageId: aero.id });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-[#0A0A0A]/40 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{aero.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                            {aero.downforceLbs} lbs Downforce
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">{aero.description}</p>
                      </div>
                      <div className="text-xs font-mono font-bold text-neutral-200">
                        {aero.price === 0 ? 'Included' : `+$${aero.price.toLocaleString()}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= WHEELS & BRAKES TAB ================= */}
        {activeTab === 'wheels' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Wheel Rim Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Wheel Design & Sizing
              </label>
              <div className="space-y-2.5">
                {selectedModel.availableWheels.map(wheel => {
                  const isSelected = wheel.id === config.wheelId;
                  return (
                    <div
                      key={wheel.id}
                      id={`wheel-${wheel.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onUpdateConfig({
                          wheelId: wheel.id,
                          wheelFinishId: wheel.finishes[0].id,
                        });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-[#0A0A0A]/40 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{wheel.name}</div>
                        <p className="text-[11px] text-neutral-400">{wheel.description}</p>
                      </div>
                      <div className="text-xs font-mono font-bold text-neutral-200">
                        {wheel.price === 0 ? 'Included' : `+$${wheel.price.toLocaleString()}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wheel Finish / Coating */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Wheel Finish Coating
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeWheel.finishes.map(finish => {
                  const isSelected = finish.id === config.wheelFinishId;
                  return (
                    <button
                      key={finish.id}
                      id={`wheel-finish-${finish.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onUpdateConfig({ wheelFinishId: finish.id });
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                          : 'border-white/10 bg-[#0A0A0A]/60 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 flex-shrink-0"
                        style={{ backgroundColor: finish.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{finish.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {finish.price === 0 ? 'Included' : `+$${finish.price}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brake Caliper Color & Brand */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Brake Caliper Color & Monoblock Finish
              </label>
              <div className="grid grid-cols-2 gap-2">
                {selectedModel.availableCalipers.map(caliper => {
                  const isSelected = caliper.id === config.caliperColorId;
                  return (
                    <button
                      key={caliper.id}
                      id={`caliper-${caliper.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onUpdateConfig({ caliperColorId: caliper.id });
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                          : 'border-white/10 bg-[#0A0A0A]/60 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 flex-shrink-0"
                        style={{ backgroundColor: caliper.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{caliper.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {caliper.price === 0 ? 'Included' : `+$${caliper.price}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= INTERIOR TAB ================= */}
        {activeTab === 'interior' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Interior Leather & Trims */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Upholstery & Interior Theme
              </label>
              <div className="space-y-2.5">
                {selectedModel.availableInteriors.map(interior => {
                  const isSelected = interior.id === config.interiorId;
                  return (
                    <div
                      key={interior.id}
                      id={`interior-${interior.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onUpdateConfig({
                          interiorId: interior.id,
                          ambientLightColor: interior.ambientLightHex,
                        });
                      }}
                      className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-[#0A0A0A]/40 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: interior.primaryHex }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-white/20 -ml-2"
                            style={{ backgroundColor: interior.secondaryHex }}
                          />
                          <span className="text-xs font-bold text-white">{interior.name}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">{interior.materials}</p>
                      </div>
                      <div className="text-xs font-mono font-bold text-neutral-200">
                        {interior.price === 0 ? 'Included' : `+$${interior.price.toLocaleString()}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ambient Interior Sensory LED Color */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Ambient Interior LED Aura
                </label>
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: config.ambientLightColor }}
                />
              </div>
              <div className="flex items-center justify-between gap-1.5 bg-[#0A0A0A] p-2 rounded-xl border border-white/10">
                {[
                  { name: 'Red', hex: '#ef4444' },
                  { name: 'Amber', hex: '#f59e0b' },
                  { name: 'Cyan', hex: '#06b6d4' },
                  { name: 'Blue', hex: '#3b82f6' },
                  { name: 'Emerald', hex: '#10b981' },
                  { name: 'Magenta', hex: '#d946ef' },
                  { name: 'White', hex: '#ffffff' },
                ].map(led => (
                  <button
                    key={led.hex}
                    id={`ambient-${led.name.toLowerCase()}`}
                    onClick={() => {
                      vehicleAudio.playLightToggle();
                      onUpdateConfig({ ambientLightColor: led.hex });
                    }}
                    title={led.name}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      config.ambientLightColor === led.hex
                        ? 'ring-2 ring-white scale-110 shadow-lg'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: led.hex }}
                  >
                    {config.ambientLightColor === led.hex && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= PACKAGES TAB ================= */}
        {activeTab === 'packages' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Performance & Technology Packages
            </label>
            {selectedModel.availablePackages.map(pkg => {
              const isSelected = config.packageIds.includes(pkg.id);
              return (
                <div
                  key={pkg.id}
                  id={`pkg-${pkg.id}`}
                  onClick={() => handleTogglePackage(pkg.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50'
                      : 'border-white/10 bg-[#0A0A0A]/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{pkg.name}</span>
                        {pkg.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-semibold border border-blue-500/30">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-bold text-neutral-200">
                        +${pkg.price.toLocaleString()}
                      </div>
                      <div
                        className={`mt-1 w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'border-white/10 bg-[#121212]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="grid grid-cols-2 gap-1 pt-2 border-t border-white/5">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="text-[10px] text-neutral-300 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= CONTROLS TAB ================= */}
        {activeTab === 'controls' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Vehicle Kinematics & Rig Controls
            </label>

            {/* Butterfly Doors Toggle */}
            <div className="p-3 bg-[#0A0A0A]/60 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Butterfly / Gullwing Doors</div>
                <div className="text-[11px] text-neutral-400">
                  Open dual aerodynamic doors to reveal cockpit
                </div>
              </div>
              <button
                id="btn-toggle-doors"
                onClick={() => {
                  vehicleAudio.playDoorLatch();
                  onUpdateConfig({ doorsOpen: !config.doorsOpen });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  config.doorsOpen
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-[#18181B] text-neutral-300 hover:bg-[#27272A] border border-white/10'
                }`}
              >
                {config.doorsOpen ? 'Opened' : 'Closed'}
              </button>
            </div>

            {/* Matrix LED Headlights Toggle */}
            <div className="p-3 bg-[#0A0A0A]/60 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Matrix LED & OLED Lightbar</div>
                <div className="text-[11px] text-neutral-400">
                  Toggle crystal headlights, laser high-beams & rear bar
                </div>
              </div>
              <button
                id="btn-toggle-headlights"
                onClick={() => {
                  vehicleAudio.playLightToggle();
                  onUpdateConfig({ headlightsOn: !config.headlightsOn });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  config.headlightsOn
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-[#18181B] text-neutral-300 hover:bg-[#27272A] border border-white/10'
                }`}
              >
                {config.headlightsOn ? 'Illuminated' : 'Off'}
              </button>
            </div>

            {/* Active Spoiler Deployment Toggle */}
            <div className="p-3 bg-[#0A0A0A]/60 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Active Rear Aerodynamics</div>
                <div className="text-[11px] text-neutral-400">
                  Deploy hydraulic downforce wing & airbrake
                </div>
              </div>
              <button
                id="btn-toggle-spoiler"
                onClick={() => {
                  vehicleAudio.playDoorLatch();
                  onUpdateConfig({
                    activeSpoilerDeployed: !config.activeSpoilerDeployed,
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  config.activeSpoilerDeployed
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-[#18181B] text-neutral-300 hover:bg-[#27272A] border border-white/10'
                }`}
              >
                {config.activeSpoilerDeployed ? 'Raised' : 'Flush'}
              </button>
            </div>

            {/* X-Ray Chassis Mode Toggle */}
            <div className="p-3 bg-[#0A0A0A]/60 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Chassis & Powertrain X-Ray</div>
                <div className="text-[11px] text-neutral-400">
                  View battery pack, electric drive units and inverters
                </div>
              </div>
              <button
                id="btn-toggle-xray-tab"
                onClick={() => {
                  vehicleAudio.playLightToggle();
                  onUpdateConfig({ xRayMode: !config.xRayMode });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  config.xRayMode
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-[#18181B] text-neutral-300 hover:bg-[#27272A] border border-white/10'
                }`}
              >
                {config.xRayMode ? 'Active' : 'Off'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Footer: Live Total MSRP & Action Buttons */}
      <div className="p-4 border-t border-white/10 bg-[#0A0A0A] space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <span>Estimated Vehicle Total</span>
              <button
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                className="text-blue-400 underline text-[10px] hover:text-blue-300"
              >
                {showPriceBreakdown ? 'Hide' : 'Itemized'}
              </button>
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              ${totalPrice.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-neutral-500 uppercase">Est. Monthly</div>
            <div className="text-sm font-bold font-mono text-blue-400">
              ${Math.round((totalPrice * 0.9) / 60 + 150).toLocaleString()}/mo*
            </div>
          </div>
        </div>

        {/* Itemized Price Breakdown Drawer */}
        {showPriceBreakdown && (
          <div className="p-3 bg-[#121212] border border-white/10 rounded-xl space-y-1.5 text-xs font-mono animate-in fade-in duration-150">
            <div className="flex justify-between text-neutral-400">
              <span>Base MSRP ({selectedModel.name})</span>
              <span>${selectedModel.basePrice.toLocaleString()}</span>
            </div>
            {activeColor.price > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Color: {activeColor.name}</span>
                <span>+${activeColor.price.toLocaleString()}</span>
              </div>
            )}
            {activeWheel.price > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Wheels: {activeWheel.name}</span>
                <span>+${activeWheel.price.toLocaleString()}</span>
              </div>
            )}
            {activeCaliper.price > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Calipers: {activeCaliper.name}</span>
                <span>+${activeCaliper.price.toLocaleString()}</span>
              </div>
            )}
            {activeRoof.price > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Roof: {activeRoof.name}</span>
                <span>+${activeRoof.price.toLocaleString()}</span>
              </div>
            )}
            {activeInterior.price > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Interior: {activeInterior.name}</span>
                <span>+${activeInterior.price.toLocaleString()}</span>
              </div>
            )}
            {activePackages.map(p => (
              <div key={p.id} className="flex justify-between text-neutral-400">
                <span>{p.name}</span>
                <span>+${p.price.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-white">
              <span>Total Price</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-open-finance-calculator"
            onClick={() => {
              vehicleAudio.playSelectBeep();
              onOpenCalculator();
            }}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-white text-xs font-bold transition-all active:scale-[0.98]"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Finance Calc</span>
          </button>

          <button
            id="btn-schedule-testdrive"
            onClick={() => {
              vehicleAudio.playSelectBeep();
              onBookTestDrive();
            }}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-extrabold shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4 fill-current" />
            <span>Book Test Drive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
