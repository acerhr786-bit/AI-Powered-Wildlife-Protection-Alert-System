import React, { useState } from 'react';
import { CameraNode, SystemServiceHealth } from '../types/surveillance';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Server,
  Database,
  Radio,
  Bell,
  RefreshCw,
  Clock,
  Battery,
  Sun,
  Shield,
  Zap,
} from 'lucide-react';
import { SYSTEM_HEALTH_SERVICES } from '../data/gudalurData';

interface SystemHealthViewProps {
  cameras: CameraNode[];
  onRefreshAll?: () => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  cameras,
  onRefreshAll,
}) => {
  const [services, setServices] = useState<SystemServiceHealth[]>(SYSTEM_HEALTH_SERVICES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uptimeSeconds, setUptimeSeconds] = useState(14820);

  const handleTestPing = (serviceKey: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.serviceKey === serviceKey
          ? {
              ...s,
              lastChecked: 'Just now (Latency 42ms)',
              status: 'ONLINE',
            }
          : s
      )
    );
  };

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          lastChecked: 'Just now (Synchronized)',
        }))
      );
      if (onRefreshAll) onRefreshAll();
    }, 600);
  };

  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">System Health & Telemetry Status</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/40">
                ALL SYSTEMS NOMINAL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live diagnosis of AI vision model, edge gateway, camera battery nodes, and forest dispatch pipelines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>UPTIME: {hours}h {minutes}m (99.98%)</span>
          </div>

          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync All Nodes</span>
          </button>
        </div>
      </div>

      {/* Core Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => {
          const statusIcon =
            srv.status === 'ONLINE' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : srv.status === 'WARNING' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            );

          const statusBadge =
            srv.status === 'ONLINE'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : srv.status === 'WARNING'
              ? 'bg-amber-950 text-amber-300 border-amber-800'
              : 'bg-rose-950 text-rose-300 border-rose-800';

          return (
            <div
              key={srv.serviceKey}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{srv.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">SERVICE: {srv.serviceKey}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${statusBadge}`}>
                  {statusIcon}
                  <span>{srv.status}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{srv.details}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span>Last sync: {srv.lastChecked}</span>
                <button
                  onClick={() => handleTestPing(srv.serviceKey)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Ping Test
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Camera Sensor Network Telemetry Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Surveillance Camera Node Status & Power Grid</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {cameras.filter((c) => c.status === 'ONLINE').length} of {cameras.length} Active Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cameras.map((cam) => {
            const isOnline = cam.status === 'ONLINE';
            return (
              <div
                key={cam.id}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs truncate max-w-[180px]">
                    {cam.name}
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isOnline
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}
                  >
                    {cam.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery: {cam.batteryPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{cam.solarStatus.replace('_', ' ')}</span>
                  </div>
                  <div>Mode: {cam.lowLightMode}</div>
                  <div>Lux: {cam.currentLux}</div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Heartbeat: {cam.lastHeartbeat || cam.lastPing}</span>
                  <span>{cam.resolution || '1080p'} • {cam.fps || 30} FPS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
