import React from 'react';
import { X, Download, ShieldAlert, Camera, MapPin, Clock, Eye, AlertTriangle } from 'lucide-react';
import { BoundingBox, RiskAssessment } from '../types/surveillance';

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  species: string;
  confidence: number;
  timestamp: string;
  cameraName: string;
  location: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  boundingBoxes?: BoundingBox[];
  humanPresence?: boolean;
  animalCount?: number;
  isDemoData?: boolean;
  riskAssessment?: RiskAssessment;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  species,
  confidence,
  timestamp,
  cameraName,
  location,
  riskLevel,
  boundingBoxes = [],
  humanPresence,
  animalCount = 1,
  isDemoData = true,
  riskAssessment,
}) => {
  if (!isOpen) return null;

  const riskBadgeColor =
    riskLevel === 'CRITICAL'
      ? 'bg-red-950 text-red-300 border-red-700'
      : riskLevel === 'HIGH'
      ? 'bg-orange-950 text-orange-300 border-orange-700'
      : riskLevel === 'MEDIUM'
      ? 'bg-amber-950 text-amber-300 border-amber-700'
      : 'bg-emerald-950 text-emerald-300 border-emerald-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{title || 'Surveillance Evidence Inspector'}</h3>
                {isDemoData && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded">
                    DEMO DATA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {cameraName} • {location} • {timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Simulated / Real Capture Canvas View */}
          <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Visual background simulation */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/40 opacity-80" />
            
            {/* Grid overlay lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

            {/* OSD Telemetry Watermark */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur font-mono text-[10px] text-emerald-400 px-2 py-1 rounded border border-emerald-900/60 z-10">
              <div>REC • 24/7 LOW-LIGHT CCTV CAPTURE</div>
              <div className="text-slate-400">{cameraName} | LUX: 0.02 | 850nm IR</div>
            </div>

            {isDemoData && (
              <div className="absolute top-3 right-3 bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono text-[11px] px-2.5 py-1 rounded z-10">
                SIMULATED EVIDENCE (DEMO)
              </div>
            )}

            {/* Render bounding boxes */}
            {boundingBoxes.length > 0 ? (
              boundingBoxes.map((box, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                    borderColor: box.color || '#ef4444',
                  }}
                  className="border-2 border-dashed rounded bg-red-500/10 transition-all flex flex-col justify-start"
                >
                  <span
                    style={{ backgroundColor: box.color || '#ef4444' }}
                    className="text-black text-[10px] font-bold font-mono px-1 py-0.5 rounded-br w-max uppercase"
                  >
                    {box.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="relative z-10 text-center space-y-2 p-6">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto opacity-70" />
                <div className="text-slate-200 font-semibold">{species}</div>
                <div className="text-xs text-slate-400">Confidence: {confidence}% • Risk: {riskLevel}</div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 bg-black/60 px-3 py-1.5 rounded">
              <span>GPS: 11.5034° N, 76.4913° E (Gudalur Sector)</span>
              <span>CONFIDENCE: {confidence}%</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Species</span>
              <span className="font-bold text-white text-sm">{species}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Threat / Risk Level</span>
              <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded border mt-1 ${riskBadgeColor}`}>
                {riskLevel}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Animal Count</span>
              <span className="font-bold text-slate-200 text-sm">{animalCount}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Human Presence</span>
              <span className={`font-bold text-sm ${humanPresence ? 'text-amber-400' : 'text-slate-400'}`}>
                {humanPresence ? 'DETECTED NEARBY' : 'NONE DETECTED'}
              </span>
            </div>
          </div>

          {/* AI Risk Explanation (Upgrade 11) */}
          {riskAssessment && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <ShieldAlert className="w-4 h-4" />
                <span>AI Risk Assessment Engine Breakdown</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{riskAssessment.reason}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <div>• {riskAssessment.factors.speciesRisk}</div>
                <div>• {riskAssessment.factors.humanPresenceRisk}</div>
                <div>• {riskAssessment.factors.settlementProximityRisk}</div>
                <div>• {riskAssessment.factors.timeOfDayRisk}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            EVIDENCE ID: EVD-{Date.now().toString().slice(-6)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('Snapshot evidence exported for Forest Division case file.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Snapshot</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
