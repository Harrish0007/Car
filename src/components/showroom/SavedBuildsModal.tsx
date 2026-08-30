import React, { useState } from 'react';
import { SavedBuild, VehicleConfiguration, VehicleModel } from '../../types/vehicle';
import { vehicleAudio } from '../../utils/audioSynth';
import { generateShareUrl, copyToClipboard } from '../../utils/shareUtils';
import {
  Bookmark,
  Share2,
  Trash2,
  Download,
  RotateCcw,
  Check,
  Calendar,
  ExternalLink,
  Car,
} from 'lucide-react';

interface SavedBuildsModalProps {
  savedBuilds: SavedBuild[];
  onLoadBuild: (build: SavedBuild) => void;
  onDeleteBuild: (id: string) => void;
  onSaveCurrentBuild: (notes?: string) => void;
  onClose: () => void;
  currentModel: VehicleModel;
  currentConfig: VehicleConfiguration;
  currentPrice: number;
}

export const SavedBuildsModal: React.FC<SavedBuildsModalProps> = ({
  savedBuilds,
  onLoadBuild,
  onDeleteBuild,
  onSaveCurrentBuild,
  onClose,
  currentModel,
  currentConfig,
  currentPrice,
}) => {
  const [notes, setNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    vehicleAudio.playSelectBeep();
    onSaveCurrentBuild(notes);
    setNotes('');
  };

  const handleShare = async (build: SavedBuild) => {
    vehicleAudio.playSelectBeep();
    const shareUrl = generateShareUrl(build.config);
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopiedId(build.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadSummary = (build: SavedBuild) => {
    vehicleAudio.playSelectBeep();
    const textContent = `=====================================================
AETHER MOTORS - BESPOKE BUILD SPECIFICATION SHEET
=====================================================
Model: ${build.modelName}
Build Date: ${new Date(build.timestamp).toLocaleString()}
Total Estimated MSRP: $${build.totalPrice.toLocaleString()}

CONFIGURATION DETAILS:
- Paint: ${build.config.finishType.toUpperCase()} (${build.config.colorId})
- Wheels: ${build.config.wheelId}
- Calipers: ${build.config.caliperColorId}
- Aerodynamics: ${build.config.aeroPackageId}
- Roof: ${build.config.roofId}
- Interior: ${build.config.interiorId}
- Packages: ${build.config.packageIds.join(', ') || 'Standard'}

Notes: ${build.notes || 'Bespoke Client Specification'}
=====================================================
Experience Center: Beverly Hills / Manhattan / Miami
Web: https://aethermotors.com
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${build.modelName.replace(/\s+/g, '-').toLowerCase()}-build-sheet.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0F0F0F] border border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-neutral-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Saved Bespoke Garage</h3>
              <p className="text-xs text-neutral-400">Save, restore, and export your custom configurations.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-sm font-mono">
            ✕
          </button>
        </div>

        {/* Save Current Build Form */}
        <form onSubmit={handleSave} className="p-4 bg-[#0A0A0A] rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Current Active Configuration
            </span>
            <span className="text-xs font-mono font-bold text-white">
              ${currentPrice.toLocaleString()}
            </span>
          </div>

          <div className="text-sm font-bold text-white">{currentModel.name}</div>
          
          <input
            type="text"
            placeholder="Add optional notes (e.g. Dream Track Spec, Track Day Titanium Wheels)..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Bookmark className="w-4 h-4 fill-current" />
            <span>Save Current Build to Garage</span>
          </button>
        </form>

        {/* Saved Builds List */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Saved Garage Configurations ({savedBuilds.length})
          </div>

          {savedBuilds.length === 0 ? (
            <div className="p-6 text-center bg-[#0A0A0A] rounded-2xl border border-white/10 text-neutral-500 text-xs">
              No saved configurations found. Customize a vehicle and click &quot;Save Current Build&quot; above.
            </div>
          ) : (
            <div className="space-y-3">
              {savedBuilds.map(build => (
                <div
                  key={build.id}
                  className="p-4 bg-[#0A0A0A] rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{build.modelName}</span>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        ${build.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    {build.notes && (
                      <p className="text-xs text-neutral-400 italic">&ldquo;{build.notes}&rdquo;</p>
                    )}
                    <div className="text-[10px] font-mono text-neutral-500">
                      Saved on {new Date(build.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onLoadBuild(build);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-bold flex items-center gap-1 border border-blue-500/30 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Load in 3D</span>
                    </button>

                    <button
                      onClick={() => handleShare(build)}
                      className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-300 hover:text-white transition-colors"
                      title="Copy Shareable Link"
                    >
                      {copiedId === build.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDownloadSummary(build)}
                      className="p-2 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-300 hover:text-white transition-colors"
                      title="Download Build Specification Sheet"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        onDeleteBuild(build.id);
                      }}
                      className="p-2 rounded-lg bg-[#18181B] hover:bg-red-500/20 border border-white/10 text-neutral-400 hover:text-red-400 transition-colors"
                      title="Delete Build"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
