import React, { useState } from 'react';
import { ConflictIncidentRecord } from '../types/surveillance';
import {
  Skull,
  GraduationCap,
  TrendingDown,
  Moon,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { downloadConflictDatasetCSV } from '../utils/exportUtils';

interface ConflictIncidentArchiveProps {
  records: ConflictIncidentRecord[];
  onSelectRecord?: (record: ConflictIncidentRecord) => void;
}

export const ConflictIncidentArchive: React.FC<ConflictIncidentArchiveProps> = ({
  records,
  onSelectRecord,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const sectors = ['ALL', 'O-Valley', 'Devala', 'Pandalur', 'Cherambadi', 'Thorapalli'];

  const filtered = records.filter(
    (r) => selectedSector === 'ALL' || r.sector.toLowerCase().includes(selectedSector.toLowerCase())
  );

  return (
    <div id="human-wildlife-conflict-research-archive" className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>College Research Study: Human Fatalities & Conflict Analysis</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                Gudalur Forest Division
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Analysis of fatal human-wildlife encounters & 24/7 low-light CCTV early warning intervention
            </p>
          </div>
        </div>

        {/* Sector Filter & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 text-[11px] px-1.5 font-medium">Sector:</span>
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedSector === sec
                    ? 'bg-rose-900/80 text-rose-200 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <button
            id="btn-export-casualties-csv"
            onClick={() => downloadConflictDatasetCSV(records)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            title="Download full incident dataset as CSV file"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Download Dataset (.csv)</span>
          </button>
        </div>
      </div>

      {/* Research Summary Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-950/50 border-b border-slate-800 text-xs">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Low-Light Encounter Rate</span>
            <Moon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">78.4%</div>
          <p className="text-[11px] text-slate-400">
            Occurred during pre-dawn (04:30–06:30) or night (18:30–23:00) with &lt;0.05 Lux visibility.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Primary Species Involved</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">68% Elephant</div>
          <p className="text-[11px] text-slate-400">
            Followed by Indian Leopard (18%), Sloth Bear (9%), and Tiger/Gaur (5%).
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Early Warning Lead Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">14–22 Mins</div>
          <p className="text-[11px] text-slate-400">
            CCTV perimeter detection provides sufficient window for RRT dispatch & worker retreat.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>False Alarm Suppression</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">100% Policy</div>
          <p className="text-[11px] text-slate-400">
            Humans are detected safely without triggering false alarms to the Forest Department.
          </p>
        </div>
      </div>

      {/* Incident Records Table / Cards */}
      <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Case Studies of Human Casualties in Gudalur Division (Nilgiris Biosphere):</span>
        </div>

        {filtered.map((record) => (
          <div
            key={record.id}
            id={`record-${record.id}`}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-3 rounded-lg text-xs space-y-2 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-700 text-rose-300 flex items-center justify-center font-bold text-[10px]">
                  ✝
                </span>
                <span className="font-bold text-slate-200">{record.victimProfile}</span>
                <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  {record.date}
                </span>
              </div>
              <div className="text-rose-400 font-semibold text-[11px]">
                {record.animalInvolved}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px]">
              <div>
                <span className="text-slate-500 font-medium">Sector:</span> {record.sector}
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-amber-400" />
                <span><b>Time:</b> {record.timeOfDay}</span>
                {record.lowLightFactor && (
                  <span className="ml-1 bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[9px] px-1 py-0.2 rounded font-mono">
                    Low Light Factor
                  </span>
                )}
              </div>
            </div>

            <p className="text-slate-400 text-[11px] italic bg-slate-900/50 p-2 rounded border border-slate-800/50">
              "{record.circumstance}"
            </p>

            <div className="text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span><b>Preventive System Impact:</b> {record.mitigationImpact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
