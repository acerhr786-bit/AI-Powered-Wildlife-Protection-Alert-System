import React, { useState } from 'react';
import { CameraNode } from '../types/surveillance';
import {
  Camera,
  Video,
  Radio,
  Battery,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Settings,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface CameraInventoryProps {
  cameras: CameraNode[];
  onSelectCamera: (camId: string) => void;
  onToggleStatus: (camId: string) => void;
  onUpdateCameraMode?: (camId: string, mode: CameraNode['lowLightMode']) => void;
}

export const CameraInventory: React.FC<CameraInventoryProps> = ({
  cameras,
  onSelectCamera,
  onToggleStatus,
  onUpdateCameraMode,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');

  const filtered = cameras.filter((c) => {
    if (filterMode === 'ONLINE') return c.status === 'ONLINE';
    if (filterMode === 'OFFLINE') return c.status !== 'ONLINE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/80 border border-blue-800/60 rounded-xl text-blue-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Camera Sensor Inventory & Edge Hardware</h2>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                {cameras.length} REGISTERED NODES
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Solar battery status, RTSP feed endpoints, Starvis low-light sensor tuning, and live heartbeats
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['ALL', 'ONLINE', 'OFFLINE'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m as any)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  filterMode === m
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Cameras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cam) => {
          const isOnline = cam.status === 'ONLINE';
          const detectionStatusBadge =
            cam.detectionStatus === 'ANIMAL_DETECTED'
              ? 'bg-red-950 text-red-300 border-red-700'
              : cam.detectionStatus === 'INVESTIGATING'
              ? 'bg-amber-950 text-amber-300 border-amber-700'
              : 'bg-emerald-950 text-emerald-300 border-emerald-700';

          return (
            <div
              key={cam.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
            >
              {/* Header */}
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{cam.name}</span>
                    {cam.isPersonalCamera && (
                      <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded">
                        MY CAMERA
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{cam.location}</div>
                </div>

                <button
                  onClick={() => onToggleStatus(cam.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                    isOnline
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800'
                  }`}
                  title="Click to toggle online/offline"
                >
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">COORDINATES</span>
                    <span className="text-slate-300">
                      {cam.coordinates[0].toFixed(4)}° N, {cam.coordinates[1].toFixed(4)}° E
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">BATTERY & SOLAR</span>
                    <span className="text-emerald-400 font-bold">{cam.batteryPercent}%</span>
                    <span className="text-slate-500 text-[9px] block truncate">{cam.solarStatus}</span>
                  </div>

                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">NIGHT-VISION SENSOR</span>
                    <span className="text-amber-300">{cam.lowLightMode}</span>
                  </div>

                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">DETECTION STATUS</span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border ${detectionStatusBadge}`}>
                      {cam.detectionStatus || 'CLEAR'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>STREAM PROTOCOL:</span>
                    <span className="text-slate-300">{cam.streamType || 'CCTV_RTSP'}</span>
                  </div>
                  {cam.rtspUrl && (
                    <div className="flex items-center justify-between">
                      <span>RTSP URL:</span>
                      <span className="text-cyan-400 truncate max-w-[150px]">{cam.rtspUrl}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>HEARTBEAT:</span>
                    <span className="text-slate-300">{cam.lastHeartbeat || cam.lastPing}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  ZONE: {cam.riskZone}
                </span>

                <button
                  onClick={() => onSelectCamera(cam.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Launch Live Feed</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
