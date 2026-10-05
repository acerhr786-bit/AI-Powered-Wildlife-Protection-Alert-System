import React from 'react';
import { CameraNode, DetectionEvent, ForestDeptAlert, IncidentRecord } from '../types/surveillance';
import {
  ShieldAlert,
  AlertTriangle,
  Camera,
  Activity,
  Flame,
  Radio,
  Eye,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  Send,
  Volume2,
  VolumeX,
  CheckCircle2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

interface ControlRoomDashboardProps {
  cameras: CameraNode[];
  activeCamera: CameraNode;
  onSelectCamera: (camId: string) => void;
  events: DetectionEvent[];
  alerts: ForestDeptAlert[];
  incidents: IncidentRecord[];
  onNavigateTab: (tab: any) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onAcknowledgeAlert?: (ticketId: string) => void;
  onViewEvidence?: (item: any) => void;
}

export const ControlRoomDashboard: React.FC<ControlRoomDashboardProps> = ({
  cameras,
  activeCamera,
  onSelectCamera,
  events,
  alerts,
  incidents,
  onNavigateTab,
  isMuted,
  onToggleMute,
  onAcknowledgeAlert,
  onViewEvidence,
}) => {
  const criticalAlerts = alerts.filter(
    (a) => (a.threatLevel === 'CRITICAL' || a.riskLevel === 'CRITICAL') && a.status !== 'RESOLVED' && a.status !== 'FALSE_POSITIVE'
  );

  const activeDetections = events.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 1. TOP PRIORITY: CRITICAL ALERTS BANNER / STACK */}
      {criticalAlerts.length > 0 ? (
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-700/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-red-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-red-950">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base tracking-tight uppercase">
                    Critical Wildlife Conflict Warning ({criticalAlerts.length} Active)
                  </h3>
                  <span className="bg-red-500 text-black text-[10px] font-black px-2 py-0.5 rounded font-mono animate-bounce">
                    IMMEDIATE SOP
                  </span>
                </div>
                <p className="text-xs text-red-200">
                  Target species detected in close proximity to human settlements during night-vision hours
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onToggleMute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  isMuted
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-red-600 text-white shadow-lg shadow-red-900 animate-pulse'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'SIREN OFF' : 'AUDIO SIREN ACTIVE'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('FOREST_DISPATCH')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-950 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
              >
                <span>Open Dispatch Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cards for each critical alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {criticalAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.ticketId}
                className="bg-black/60 backdrop-blur border border-red-700/60 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-red-400 font-bold block">
                      TICKET #{alert.ticketId}
                    </span>
                    <h4 className="font-bold text-white text-sm">{alert.species}</h4>
                    <span className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>{alert.location}</span>
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-900 text-red-100 border border-red-600">
                    {alert.threatLevel}
                  </span>
                </div>

                {alert.riskExplanation && (
                  <p className="text-[11px] text-red-200 bg-red-950/50 p-2.5 rounded-lg border border-red-900/60 leading-relaxed font-sans">
                    {alert.riskExplanation}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-red-900/40">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Status: <strong className="text-amber-300">{alert.status}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    {onViewEvidence && (
                      <button
                        onClick={() => onViewEvidence(alert)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                      >
                        Evidence
                      </button>
                    )}
                    {onAcknowledgeAlert && alert.status === 'NEW' && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.ticketId)}
                        className="px-2.5 py-1 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Perimeter Surveillance Active — No Critical Breaches</h3>
              <p className="text-xs text-slate-400">All 6 Gudalur camera nodes scanning continuous 24/7 infrared stream</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('SURVEILLANCE')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors font-semibold"
          >
            Launch Live Feed
          </button>
        </div>
      )}

      {/* 2. MIDDLE ROW: MULTI-CAMERA PREVIEW GRID & ACTIVE DETECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Multi-Camera Grid (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Live Multi-Camera Surveillance Grid</h3>
            </div>
            <button
              onClick={() => onNavigateTab('SURVEILLANCE')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Full Screen Camera</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 6-Camera Grid Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cameras.map((cam) => {
              const isSelected = cam.id === activeCamera.id;
              const isAlert = cam.detectionStatus === 'ANIMAL_DETECTED';

              return (
                <div
                  key={cam.id}
                  onClick={() => onSelectCamera(cam.id)}
                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all p-2 flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-slate-950 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/20'
                      : isAlert
                      ? 'border-red-600 bg-red-950/30'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  {/* Overlay scan effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* Top Bar */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                    <span className="bg-black/60 px-1.5 py-0.5 rounded text-slate-300 font-bold truncate max-w-[90px]">
                      {cam.id === 'cam-my-personal' ? 'MY CAM' : cam.id.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE</span>
                    </span>
                  </div>

                  {/* Center detection cue */}
                  {isAlert && (
                    <div className="relative z-10 text-center">
                      <span className="bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        ALERT ACTIVE
                      </span>
                    </div>
                  )}

                  {/* Bottom Bar */}
                  <div className="relative z-10 text-[10px] text-slate-300 font-mono truncate">
                    <div>{cam.name.split('[')[0]}</div>
                    <div className="text-slate-500 text-[9px]">{cam.lowLightMode}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono text-[11px]">
            <span>Active Feed: <strong className="text-emerald-400">{activeCamera.name}</strong></span>
            <span>Sensor Lux: {activeCamera.currentLux}</span>
          </div>
        </div>

        {/* Active Detections Feed (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Recent Real-Time Ingress Detections</h3>
            </div>
            <button
              onClick={() => onNavigateTab('FEED')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View Feed ({events.length})
            </button>
          </div>

          <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
            {activeDetections.map((ev) => {
              const isWildlife = ev.detectedType === 'wild_animal' || ev.detectedType === 'wild_animal_human_conflict';
              return (
                <div
                  key={ev.id}
                  onClick={() => onViewEvidence && onViewEvidence(ev)}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{ev.species || 'Unknown'}</span>
                      {ev.isDemoData && (
                        <span className="text-[9px] bg-slate-800 text-amber-400 px-1 py-0.2 rounded border border-slate-700">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{ev.timestamp}</span>
                      <span>•</span>
                      <span>{ev.cameraName.split('[')[0]}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        ev.threatLevel === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border-red-700'
                          : ev.threatLevel === 'HIGH'
                          ? 'bg-orange-950 text-orange-300 border-orange-700'
                          : isWildlife
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      }`}
                    >
                      {ev.threatLevel}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      {ev.confidence}% conf
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: HIGH-RISK LOCATIONS & QUICK ACCESS TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tactical Map Shortcut */}
        <div
          onClick={() => onNavigateTab('MAP')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs text-emerald-400 font-mono group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Open GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h4 className="font-bold text-white text-base">Tactical Wildlife GIS Map</h4>
            <p className="text-xs text-slate-400 mt-1">
              Explore documented elephant corridors, high-risk tea estate fringes, and live camera markers in Gudalur Division.
            </p>
          </div>
        </div>

        {/* Animal Activity / Movement Tracker Shortcut */}
        <div
          onClick={() => onNavigateTab('ANIMAL_ACTIVITY')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-xl text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs text-amber-400 font-mono group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Track Trajectories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h4 className="font-bold text-white text-base">Wildlife Movement History</h4>
            <p className="text-xs text-slate-400 mt-1">
              Analyze chronological multi-camera sequential trails and corridor vectors without biometric over-claiming.
            </p>
          </div>
        </div>

        {/* Incident Management Shortcut */}
        <div
          onClick={() => onNavigateTab('INCIDENTS')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-purple-950/80 border border-purple-800/60 rounded-xl text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs text-purple-400 font-mono group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>{incidents.length} Logged</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h4 className="font-bold text-white text-base">Field Incident Management</h4>
            <p className="text-xs text-slate-400 mt-1">
              Assigned forest officer tickets, mitigation resolution notes, and property damage tracking records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
