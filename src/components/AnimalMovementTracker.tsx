import React, { useState } from 'react';
import { WildlifeSightingTrack } from '../types/surveillance';
import {
  Compass,
  Footprints,
  Clock,
  MapPin,
  Camera,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AnimalMovementTrackerProps {
  tracks: WildlifeSightingTrack[];
  onViewOnMap?: (track: WildlifeSightingTrack) => void;
}

export const AnimalMovementTracker: React.FC<AnimalMovementTrackerProps> = ({
  tracks,
  onViewOnMap,
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL');

  const speciesOptions = ['ALL', 'Asian Elephant', 'Indian Leopard', 'Bengal Tiger', 'Wild Boar'];

  const filteredTracks = tracks
    .filter((t) => selectedSpecies === 'ALL' || t.species.toLowerCase().includes(selectedSpecies.toLowerCase()))
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  return (
    <div className="space-y-6">
      {/* Header & Disclaimer Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-xl text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Wildlife Ingress & Movement History</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/40">
                  TEMPORAL SEQUENCE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-camera chronological tracking across Gudalur elephant corridors and tea estate perimeters
              </p>
            </div>
          </div>

          {/* Species Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 px-2 font-mono text-[11px]">Species:</span>
            {speciesOptions.map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSpecies(sp)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedSpecies === sp
                    ? 'bg-slate-800 text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Mandatory Ethical / Biometric Re-ID Disclaimer (Upgrade 6 Rule) */}
        <div className="bg-slate-950 border border-amber-900/60 p-3.5 rounded-xl flex items-start gap-3 text-xs text-amber-200/90">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Biometric Tracking Disclaimer & SOP:</span>
            <p className="text-slate-300 leading-relaxed">
              Movement sequence is modeled strictly using temporal camera event timestamps, field post vector analysis, and corridor geometry.
              This system does <span className="underline font-semibold text-white">not</span> claim individual animal biometric re-identification (e.g. ear-notch / stripe pattern recognition) unless certified edge-AI re-ID hardware is engaged.
            </p>
          </div>
        </div>
      </div>

      {/* Sequential Hop Pathway Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-400" />
          <span>Active Ingress Progression (Chronological Camera Hops)</span>
        </h3>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {filteredTracks.map((trk, idx) => {
            const riskColor =
              trk.risk === 'CRITICAL'
                ? 'border-red-600 bg-red-950/30 text-red-300'
                : trk.risk === 'HIGH'
                ? 'border-orange-600 bg-orange-950/30 text-orange-300'
                : 'border-amber-600 bg-amber-950/30 text-amber-300';

            return (
              <div
                key={trk.id}
                className={`p-4 rounded-xl border relative flex flex-col justify-between space-y-3 ${riskColor}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 border border-white/10 font-bold">
                    STEP #{trk.sequenceOrder}
                  </span>
                  <span className="text-xs font-mono font-semibold">{trk.timestamp}</span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">{trk.species}</div>
                  <div className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trk.location}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Camera className="w-3 h-3 text-slate-500" />
                    <span>{trk.cameraName}</span>
                  </div>
                </div>

                {/* Direction and heading */}
                {trk.direction && (
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-[11px] text-slate-200 flex items-center gap-1.5 font-mono">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{trk.direction}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono">
                  <span>CONFIDENCE: {trk.confidence}%</span>
                  <span className="font-bold uppercase">{trk.risk} RISK</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sighting Timeline Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-200 text-xs font-mono uppercase">Recorded Corridor Transit Log</h4>
          <span className="text-[11px] text-slate-400 font-mono">{filteredTracks.length} Sightings Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3">Sequence</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Species Detected</th>
                <th className="px-4 py-3">Camera Node</th>
                <th className="px-4 py-3">Location / Corridor</th>
                <th className="px-4 py-3">Vector Trajectory</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3 text-right">Map View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredTracks.map((trk) => (
                <tr key={trk.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">#{trk.sequenceOrder}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{trk.timestamp}</td>
                  <td className="px-4 py-3 font-semibold text-slate-100">{trk.species}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{trk.cameraName}</td>
                  <td className="px-4 py-3">{trk.location}</td>
                  <td className="px-4 py-3 text-cyan-300 font-mono text-[11px]">{trk.direction || 'Holding Position'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      {trk.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onViewOnMap && (
                      <button
                        onClick={() => onViewOnMap(trk)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
                      >
                        Locate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
