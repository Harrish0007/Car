/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  VehicleModel,
  VehicleConfiguration,
  SavedBuild,
  ShowroomLocation,
} from './types/vehicle';
import {
  VEHICLE_MODELS,
  DEFAULT_CONFIG,
  SAMPLE_SAVED_BUILDS,
  SHOWROOM_LOCATIONS,
} from './data/vehiclesData';
import { VehicleCanvas } from './components/3d/VehicleCanvas';
import { ConfiguratorPanel } from './components/configurator/ConfiguratorPanel';
import { FinancialCalculator } from './components/calculator/FinancialCalculator';
import { TestDriveScheduler } from './components/scheduling/TestDriveScheduler';
import { VehicleShowcase } from './components/showroom/VehicleShowcase';
import { ShowroomLocationsView } from './components/showroom/ShowroomLocationsView';
import { SavedBuildsModal } from './components/showroom/SavedBuildsModal';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { vehicleAudio } from './utils/audioSynth';
import confetti from 'canvas-confetti';
import {
  Sliders,
  DollarSign,
  Calendar,
  Compass,
  MapPin,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<
    'configurator' | 'showcase' | 'calculator' | 'scheduling' | 'locations'
  >('configurator');

  const [selectedModelId, setSelectedModelId] = useState<string>(VEHICLE_MODELS[0].id);
  const [config, setConfig] = useState<VehicleConfiguration>(DEFAULT_CONFIG);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(SAMPLE_SAVED_BUILDS);
  const [showGarageModal, setShowGarageModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Model object
  const selectedModel = useMemo(() => {
    return VEHICLE_MODELS.find(m => m.id === selectedModelId) || VEHICLE_MODELS[0];
  }, [selectedModelId]);

  // Load saved garage from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aether_saved_builds');
      if (stored) {
        setSavedBuilds(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }

    // Check URL search parameters for shared build
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlModel = params.get('model');

      if (urlModel && VEHICLE_MODELS.some(m => m.id === urlModel)) {
        const foundModel = VEHICLE_MODELS.find(m => m.id === urlModel)!;
        setSelectedModelId(urlModel);

        const urlColor = params.get('color');
        const urlFinish = params.get('finish') as any;
        const urlWheel = params.get('wheel');
        const urlWheelFinish = params.get('wheelFinish');
        const urlCaliper = params.get('caliper');
        const urlAero = params.get('aero');
        const urlRoof = params.get('roof');
        const urlInterior = params.get('interior');
        const urlAmbient = params.get('ambient');
        const urlPackages = params.get('packages');
        const urlPreset = params.get('preset') as any;

        const validColor = foundModel.availableColors.some(c => c.id === urlColor) ? urlColor : foundModel.availableColors[0]?.id;
        const validWheel = foundModel.availableWheels.some(w => w.id === urlWheel) ? urlWheel : foundModel.availableWheels[0]?.id;
        const wheelObj = foundModel.availableWheels.find(w => w.id === validWheel);
        const validWheelFinish = wheelObj?.finishes.some(f => f.id === urlWheelFinish) ? urlWheelFinish : wheelObj?.finishes[0]?.id;
        const validCaliper = foundModel.availableCalipers.some(c => c.id === urlCaliper) ? urlCaliper : foundModel.availableCalipers[0]?.id;
        const validAero = foundModel.availableAero.some(a => a.id === urlAero) ? urlAero : foundModel.availableAero[0]?.id;
        const validRoof = foundModel.availableRoofs.some(r => r.id === urlRoof) ? urlRoof : foundModel.availableRoofs[0]?.id;
        const validInterior = foundModel.availableInteriors.some(i => i.id === urlInterior) ? urlInterior : foundModel.availableInteriors[0]?.id;
        const intObj = foundModel.availableInteriors.find(i => i.id === validInterior);

        const pkgList = urlPackages ? urlPackages.split(',').filter(pId => foundModel.availablePackages.some(pkg => pkg.id === pId)) : [];

        setConfig(prev => ({
          ...prev,
          modelId: urlModel,
          ...(validColor ? { colorId: validColor } : {}),
          ...(urlFinish ? { finishType: urlFinish } : {}),
          ...(validWheel ? { wheelId: validWheel } : {}),
          ...(validWheelFinish ? { wheelFinishId: validWheelFinish } : {}),
          ...(validCaliper ? { caliperColorId: validCaliper } : {}),
          ...(validAero ? { aeroPackageId: validAero } : {}),
          ...(validRoof ? { roofId: validRoof } : {}),
          ...(validInterior ? { interiorId: validInterior } : {}),
          ambientLightColor: urlAmbient ? `#${urlAmbient.replace('#', '')}` : (intObj?.ambientLightHex || prev.ambientLightColor),
          packageIds: pkgList,
          ...(urlPreset ? { studioPreset: urlPreset } : {}),
        }));

        triggerToast(`Loaded bespoke ${foundModel.name} build from link!`);
      }
    }
  }, []);

  // Update Config handler
  const handleUpdateConfig = (partial: Partial<VehicleConfiguration>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  };

  // Switch Model handler
  const handleSelectModel = (modelId: string) => {
    const newModel = VEHICLE_MODELS.find(m => m.id === modelId);
    if (!newModel) return;

    setSelectedModelId(modelId);
    setConfig(prev => ({
      ...prev,
      modelId: newModel.id,
      colorId: newModel.availableColors[0]?.id || prev.colorId,
      wheelId: newModel.availableWheels[0]?.id || prev.wheelId,
      wheelFinishId: newModel.availableWheels[0]?.finishes[0]?.id || prev.wheelFinishId,
      caliperColorId: newModel.availableCalipers[0]?.id || prev.caliperColorId,
      aeroPackageId: newModel.availableAero[0]?.id || prev.aeroPackageId,
      roofId: newModel.availableRoofs[0]?.id || prev.roofId,
      interiorId: newModel.availableInteriors[0]?.id || prev.interiorId,
      ambientLightColor: newModel.availableInteriors[0]?.ambientLightHex || prev.ambientLightColor,
      packageIds: [],
    }));
  };

  // Compute Total Vehicle Price
  const totalPrice = useMemo(() => {
    const color = selectedModel.availableColors.find(c => c.id === config.colorId);
    const wheel = selectedModel.availableWheels.find(w => w.id === config.wheelId);
    const wheelFinish = wheel?.finishes.find(f => f.id === config.wheelFinishId);
    const caliper = selectedModel.availableCalipers.find(c => c.id === config.caliperColorId);
    const aero = selectedModel.availableAero.find(a => a.id === config.aeroPackageId);
    const roof = selectedModel.availableRoofs.find(r => r.id === config.roofId);
    const interior = selectedModel.availableInteriors.find(i => i.id === config.interiorId);
    const pkgs = selectedModel.availablePackages.filter(p => config.packageIds.includes(p.id));

    const optionsSum =
      (color?.price || 0) +
      (wheel?.price || 0) +
      (wheelFinish?.price || 0) +
      (caliper?.price || 0) +
      (aero?.price || 0) +
      (roof?.price || 0) +
      (interior?.price || 0) +
      pkgs.reduce((acc, p) => acc + p.price, 0);

    return selectedModel.basePrice + optionsSum;
  }, [selectedModel, config]);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save current configuration to garage
  const handleSaveCurrentBuild = (notes?: string) => {
    const newBuild: SavedBuild = {
      id: `build-${Date.now()}`,
      timestamp: new Date().toISOString(),
      modelName: selectedModel.name,
      config: { ...config },
      totalPrice,
      notes: notes || 'Bespoke Studio Specification',
    };

    const updated = [newBuild, ...savedBuilds];
    setSavedBuilds(updated);
    try {
      localStorage.setItem('aether_saved_builds', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    triggerToast(`Build saved to your Bespoke Garage!`);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Load build from garage
  const handleLoadBuild = (build: SavedBuild) => {
    setSelectedModelId(build.config.modelId);
    setConfig(build.config);
    setShowGarageModal(false);
    setActiveView('configurator');
    triggerToast(`Loaded ${build.modelName} build into 3D viewer.`);
  };

  // Delete build from garage
  const handleDeleteBuild = (id: string) => {
    const updated = savedBuilds.filter(b => b.id !== id);
    setSavedBuilds(updated);
    try {
      localStorage.setItem('aether_saved_builds', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Quick navigation helpers
  const handleSelectAndConfigure = (modelId: string) => {
    handleSelectModel(modelId);
    setActiveView('configurator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookTestDriveForModel = (modelId: string) => {
    handleSelectModel(modelId);
    setActiveView('scheduling');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookDriveAtLocation = (loc: ShowroomLocation) => {
    setActiveView('scheduling');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* 1. Header Navigation */}
      <Header
        activeView={activeView}
        onNavigate={view => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenGarage={() => setShowGarageModal(true)}
        savedBuildsCount={savedBuilds.length}
      />

      {/* 2. Main Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= VIEW 1: 3D CONFIGURATOR ================= */}
        {activeView === 'configurator' && (
          <div className="space-y-6">
            {/* Quick Model Headline & Live Price Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F0F0F] p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedModel.category}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    0-60 in {selectedModel.specs.acceleration060}s · {selectedModel.specs.horsepower} HP
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
                  {selectedModel.name}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-neutral-400">Total Build Price</div>
                  <div className="text-2xl font-bold font-mono text-blue-400">
                    ${totalPrice.toLocaleString()}
                  </div>
                </div>

                <button
                  id="btn-main-finance"
                  onClick={() => {
                    vehicleAudio.playSelectBeep();
                    setActiveView('calculator');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Finance</span>
                </button>

                <button
                  id="btn-main-drive"
                  onClick={() => {
                    vehicleAudio.playSelectBeep();
                    setActiveView('scheduling');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 fill-current" />
                  <span>Book Drive</span>
                </button>
              </div>
            </div>

            {/* 3D Canvas + Options Customizer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left/Top: High-Fidelity 3D WebGL Vehicle Canvas */}
              <div className="lg:col-span-7 xl:col-span-8 min-h-[480px] lg:min-h-[640px] flex flex-col">
                <VehicleCanvas
                  model={selectedModel}
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                />
              </div>

              {/* Right/Bottom: Interactive Configurator Controls */}
              <div className="lg:col-span-5 xl:col-span-4 min-h-[550px] flex flex-col">
                <ConfiguratorPanel
                  models={VEHICLE_MODELS}
                  selectedModel={selectedModel}
                  config={config}
                  onSelectModel={handleSelectModel}
                  onUpdateConfig={handleUpdateConfig}
                  onBookTestDrive={() => setActiveView('scheduling')}
                  onOpenCalculator={() => setActiveView('calculator')}
                  onSaveBuild={() => handleSaveCurrentBuild()}
                />
              </div>
            </div>

            {/* Bottom Quick Feature Highlights for Active Model */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/10">
                <div className="text-xs text-neutral-400 font-mono uppercase">Acceleration</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  0-60 in {selectedModel.specs.acceleration060}s
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Sub-second launch torque</div>
              </div>

              <div className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/10">
                <div className="text-xs text-neutral-400 font-mono uppercase">Peak Output</div>
                <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                  {selectedModel.specs.horsepower} HP
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">{selectedModel.specs.drivetrain}</div>
              </div>

              <div className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/10">
                <div className="text-xs text-neutral-400 font-mono uppercase">Estimated Range</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {selectedModel.specs.rangeMiles} Miles
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">High-density liquid cooled</div>
              </div>

              <div className="p-4 bg-[#0F0F0F] rounded-2xl border border-white/10">
                <div className="text-xs text-neutral-400 font-mono uppercase">Maximum Speed</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {selectedModel.specs.topSpeedMph} MPH
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Active DRS aerodynamics</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: SHOWCASE / FLEET LINEUP ================= */}
        {activeView === 'showcase' && (
          <VehicleShowcase
            models={VEHICLE_MODELS}
            onSelectAndConfigure={handleSelectAndConfigure}
            onBookTestDrive={handleBookTestDriveForModel}
          />
        )}

        {/* ================= VIEW 3: FINANCIAL & LEASE CALCULATOR ================= */}
        {activeView === 'calculator' && (
          <FinancialCalculator
            model={selectedModel}
            config={config}
            totalPrice={totalPrice}
            onBookTestDrive={() => setActiveView('scheduling')}
          />
        )}

        {/* ================= VIEW 4: TEST DRIVE SCHEDULER ================= */}
        {activeView === 'scheduling' && (
          <TestDriveScheduler
            models={VEHICLE_MODELS}
            selectedModel={selectedModel}
            config={config}
            totalPrice={totalPrice}
            onSelectModel={handleSelectModel}
          />
        )}

        {/* ================= VIEW 5: SHOWROOM LOCATIONS ================= */}
        {activeView === 'locations' && (
          <ShowroomLocationsView onBookDriveAtLocation={handleBookDriveAtLocation} />
        )}
      </main>

      {/* 3. Footer Component */}
      <Footer />

      {/* 4. Saved Builds Modal */}
      {showGarageModal && (
        <SavedBuildsModal
          savedBuilds={savedBuilds}
          onLoadBuild={handleLoadBuild}
          onDeleteBuild={handleDeleteBuild}
          onSaveCurrentBuild={handleSaveCurrentBuild}
          onClose={() => setShowGarageModal(false)}
          currentModel={selectedModel}
          currentConfig={config}
          currentPrice={totalPrice}
        />
      )}

      {/* 5. Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-blue-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
