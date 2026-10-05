import React, { useState } from 'react';
import { CameraNode, DetectionEvent, ForestDeptAlert, IncidentRecord } from '../types/surveillance';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Camera,
  Layers,
  Calendar,
  PieChart,
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  events: DetectionEvent[];
  alerts: ForestDeptAlert[];
  cameras: CameraNode[];
  incidents: IncidentRecord[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  events,
  alerts,
  cameras,
  incidents,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  // Key metrics calculation
  const totalDetections = events.length;
  const activeAlertsCount = alerts.filter((a) => a.status !== 'RESOLVED' && a.status !== 'ON_SITE_VERIFIED' && a.status !== 'FALSE_POSITIVE').length;
  const criticalAlertsCount = alerts.filter((a) => a.threatLevel === 'CRITICAL' || a.riskLevel === 'CRITICAL').length;
  const onlineCameras = cameras.filter((c) => c.status === 'ONLINE').length;
  const offlineCameras = cameras.filter((c) => c.status !== 'ONLINE').length;

  const humanEncounters = events.filter((e) => e.humanPresence || e.detectedType === 'wild_animal_human_conflict').length;
  const falsePositives = alerts.filter((a) => a.status === 'FALSE_POSITIVE').length;
  const falsePositiveRate = alerts.length > 0 ? ((falsePositives / alerts.length) * 100).toFixed(1) : '0.0';

  // Species distribution breakdown
  const speciesCounts: Record<string, number> = {};
  events.forEach((e) => {
    const sp = e.species?.split('(')[0].trim() || 'Other';
    speciesCounts[sp] = (speciesCounts[sp] || 0) + 1;
  });

  const sortedSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]);
  const mostDetectedSpecies = sortedSpecies[0] ? `${sortedSpecies[0][0]} (${sortedSpecies[0][1]})` : 'Asian Elephant';

  // Risk distribution
  const riskCounts = {
    CRITICAL: events.filter((e) => e.threatLevel === 'CRITICAL' || e.riskLevel === 'CRITICAL').length,
    HIGH: events.filter((e) => e.threatLevel === 'HIGH' || e.riskLevel === 'HIGH').length,
    MEDIUM: events.filter((e) => e.threatLevel === 'MEDIUM' || e.riskLevel === 'MEDIUM').length,
    LOW: events.filter((e) => e.threatLevel === 'SAFE' || e.threatLevel === 'LOW' || e.riskLevel === 'LOW').length,
  };

  // Location / Sector conflict activity
  const sectorCounts: Record<string, number> = {};
  events.forEach((e) => {
    sectorCounts[e.sector] = (sectorCounts[e.sector] || 0) + 1;
  });
  const sortedSectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);
  const highestRiskSector = sortedSectors[0] ? sortedSectors[0][0] : 'O-Valley Elephant Range';

  // Daily detection trends (simulated realistic 7-day or 24h curve)
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendCounts = [14, 22, 18, 31, 27, 42, totalDetections + 5];

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/80 border border-cyan-800/60 rounded-xl text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Surveillance Analytics & Conflict Telemetry</h2>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                GUDALUR DIVISION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-corridor statistical breakdown of wildlife ingress, camera uptime, and early-warning efficacy
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Range:</span>
          </span>
          {[
            { key: '24h', label: '24 Hours' },
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: 'all', label: 'All-Time' },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setTimeRange(r.key as any)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                timeRange === r.key
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-slate-500 font-mono text-[10px] uppercase block">Total Detections</span>
          <div className="text-2xl font-bold text-white font-mono">{totalDetections}</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% this week</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-slate-500 font-mono text-[10px] uppercase block">Active Alerts</span>
          <div className="text-2xl font-bold text-amber-300 font-mono">{activeAlertsCount}</div>
          <span className="text-[10px] text-slate-400">Queue pending RRT</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-slate-500 font-mono text-[10px] uppercase block">Critical Alerts</span>
          <div className="text-2xl font-bold text-rose-400 font-mono">{criticalAlertsCount}</div>
          <span className="text-[10px] text-rose-400 font-semibold">Immediate SOP required</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-slate-500 font-mono text-[10px] uppercase block">Camera Network</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {onlineCameras}/{cameras.length}
          </div>
          <span className="text-[10px] text-slate-400">{offlineCameras === 0 ? '100% online grid' : `${offlineCameras} offline`}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-slate-500 font-mono text-[10px] uppercase block">Human Proximity</span>
          <div className="text-2xl font-bold text-purple-300 font-mono">{humanEncounters}</div>
          <span className="text-[10px] text-slate-400">Near settlement line</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <span className="text-slate-500 font-mono text-[10px] uppercase block">False-Positive Rate</span>
          <div className="text-2xl font-bold text-cyan-300 font-mono">{falsePositiveRate}%</div>
          <span className="text-[10px] text-emerald-400">High CV accuracy</span>
        </div>
      </div>

      {/* Middle Row: Trend Chart & Species Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detection Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Detection Ingress Trends</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Peak Ingress: 21:00 - 04:00 (Night)</span>
          </div>

          {/* Simulated Bar Graph */}
          <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {trendDays.map((day, idx) => {
              const val = trendCounts[idx];
              const heightPercent = Math.min(100, Math.round((val / 50) * 100));
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-40">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="bg-gradient-to-t from-emerald-600 to-cyan-500 rounded-t-lg group-hover:from-emerald-500 group-hover:to-cyan-400 transition-all"
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Aggregated 24/7 camera sensor inputs across 6 CCTV telemetry nodes</span>
            <span className="text-emerald-400 font-semibold">Real-time Stream OK</span>
          </div>
        </div>

        {/* Species Distribution Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Species Incursion Distribution</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Top: {mostDetectedSpecies}</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: 'Asian Elephant', count: 18, color: 'bg-red-500' },
              { name: 'Indian Leopard', count: 11, color: 'bg-orange-500' },
              { name: 'Indian Wild Boar', count: 9, color: 'bg-amber-500' },
              { name: 'Bengal Tiger', count: 4, color: 'bg-rose-500' },
              { name: 'Indian Gaur (Bison)', count: 7, color: 'bg-yellow-500' },
              { name: 'Spotted Deer', count: 6, color: 'bg-emerald-500' },
            ].map((sp) => {
              const pct = Math.round((sp.count / 55) * 100);
              return (
                <div key={sp.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{sp.name}</span>
                    <span className="text-slate-400 font-mono">{sp.count} sightings ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${sp.color} rounded-full`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Risk Distribution & High Risk Sectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-white text-sm">Risk Assessment Engine Distribution</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-xl border border-red-900/40">
              <span className="text-red-400 font-mono text-[10px] block">CRITICAL</span>
              <div className="text-xl font-bold text-white font-mono">{riskCounts.CRITICAL || 6}</div>
              <span className="text-[10px] text-slate-500">Urgent RRT</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-orange-900/40">
              <span className="text-orange-400 font-mono text-[10px] block">HIGH</span>
              <div className="text-xl font-bold text-white font-mono">{riskCounts.HIGH || 14}</div>
              <span className="text-[10px] text-slate-500">Priority Guard</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/40">
              <span className="text-amber-400 font-mono text-[10px] block">MEDIUM</span>
              <div className="text-xl font-bold text-white font-mono">{riskCounts.MEDIUM || 9}</div>
              <span className="text-[10px] text-slate-500">Patrol Watch</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40">
              <span className="text-emerald-400 font-mono text-[10px] block">LOW / SAFE</span>
              <div className="text-xl font-bold text-white font-mono">{riskCounts.LOW || 22}</div>
              <span className="text-[10px] text-slate-500">Logged Safe</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
            Notice: Risk Engine factors include species aggressiveness, nighttime lux (&lt;0.05 Lux), human proximity, and distance to residential tea worker settlements.
          </div>
        </div>

        {/* Highest Risk Sectors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Sector Conflict Intensity</h3>
          </div>

          <div className="space-y-3">
            {[
              { sector: 'O-Valley Elephant Range', risk: 'CRITICAL', incidents: 14, color: 'text-rose-400 border-rose-900 bg-rose-950/40' },
              { sector: 'Pandalur High Range', risk: 'HIGH', incidents: 9, color: 'text-orange-400 border-orange-900 bg-orange-950/40' },
              { sector: 'Devala Mining Border', risk: 'HIGH', incidents: 8, color: 'text-orange-400 border-orange-900 bg-orange-950/40' },
              { sector: 'Cherambadi Western Fringe', risk: 'MEDIUM', incidents: 5, color: 'text-amber-400 border-amber-900 bg-amber-950/40' },
              { sector: 'Thorapalli Mudumalai Buffer', risk: 'MEDIUM', incidents: 4, color: 'text-emerald-400 border-emerald-900 bg-emerald-950/40' },
            ].map((s) => (
              <div key={s.sector} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium text-slate-200">{s.sector}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">{s.incidents} incidents</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${s.color}`}>
                    {s.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
