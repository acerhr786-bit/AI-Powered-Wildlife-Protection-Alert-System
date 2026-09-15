import React, { useState } from 'react';
import { DetectionEvent } from '../types/surveillance';
import {
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  Filter,
  Eye,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface PersonalDashboardFeedProps {
  events: DetectionEvent[];
  onSelectEvent?: (event: DetectionEvent) => void;
}

export const PersonalDashboardFeed: React.FC<PersonalDashboardFeedProps> = ({
  events,
  onSelectEvent,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'MY_CAMERA_ONLY' | 'WILD_ANIMALS' | 'HUMANS'>('ALL');

  const filtered = events.filter((e) => {
    if (filter === 'MY_CAMERA_ONLY') return e.source === 'my_camera';
    if (filter === 'WILD_ANIMALS') return e.detectedType === 'wild_animal';
    if (filter === 'HUMANS') return e.detectedType === 'human';
    return true;
  });

  const animalCount = events.filter((e) => e.detectedType === 'wild_animal').length;
  const humanCount = events.filter((e) => e.detectedType === 'human').length;

  return (
    <div id="personal-dashboard-feed" className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>My Personal Dashboard Event Stream</span>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] px-2 py-0.2 rounded font-mono">
                LIVE 24/7 LOG
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Captures from My Own Camera & Connected Nilgiris CCTV Grid
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter('MY_CAMERA_ONLY')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'MY_CAMERA_ONLY'
                ? 'bg-cyan-900 text-cyan-200 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ★ My Camera
          </button>
          <button
            onClick={() => setFilter('WILD_ANIMALS')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'WILD_ANIMALS'
                ? 'bg-red-900 text-red-200 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wild Animals ({animalCount})
          </button>
          <button
            onClick={() => setFilter('HUMANS')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'HUMANS'
                ? 'bg-emerald-900 text-emerald-200 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Humans Only ({humanCount})
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No events match the selected filter.
          </div>
        ) : (
          filtered.map((evt) => {
            const isAnimal = evt.detectedType === 'wild_animal';
            const isMyCamera = evt.source === 'my_camera';

            return (
              <div
                key={evt.id}
                id={`event-item-${evt.id}`}
                className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-all ${
                  isAnimal
                    ? 'bg-red-950/20 border-red-900/60 hover:border-red-600 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Event Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isAnimal ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    )}

                    <span className="font-bold text-slate-100 text-sm">
                      {evt.species}
                    </span>

                    {isMyCamera && (
                      <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        ★ CAPTURED IN MY CAMERA
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isAnimal
                          ? 'bg-red-900/60 text-red-300 border border-red-700 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {evt.confidence}% CONFIDENCE
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{evt.timestamp}</span>
                  </div>
                </div>

                {/* Event Body Description */}
                <p className="text-slate-300 text-xs pl-4.5 border-l-2 border-slate-800">
                  {evt.details}
                </p>

                {/* Tactical Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span><b>Device:</b> {evt.cameraName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span><b>Sector:</b> {evt.sector}</span>
                  </div>
                </div>

                {/* Policy Enforcement Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  {isAnimal ? (
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40">
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Forest Dept Alert Dispatched: Ticket #{evt.dispatchTicketId || 'PENDING'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        Policy Enforcement: Human Activity Verified (Forest Dept Alert Suppressed)
                      </span>
                    </div>
                  )}

                  <div className="text-slate-400 font-mono text-[10px]">
                    {evt.isLowLight ? '🌙 Low Light IR Sensor' : '☀️ Standard Daylight'} (Lux: {evt.luxLevel})
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
