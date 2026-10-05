import React, { useState } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Radio,
  Moon,
  Clock,
  PhoneCall,
  Activity,
  Trees,
  Layers,
  Download,
  FileText,
  FileSpreadsheet,
  FolderArchive,
  ChevronDown,
  ExternalLink,
  UserCheck,
  Compass,
  BarChart3,
  Camera,
  Server,
  Eye,
  Sliders,
} from 'lucide-react';
import { UserRole } from '../types/surveillance';

export type ActiveTabType =
  | 'DASHBOARD'
  | 'SURVEILLANCE'
  | 'MAP'
  | 'FOREST_DISPATCH'
  | 'INCIDENTS'
  | 'ANIMAL_ACTIVITY'
  | 'ANALYTICS'
  | 'CASUALTIES'
  | 'CAMERAS'
  | 'SYSTEM_HEALTH'
  | 'FEED';

interface HeaderBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  activeAlertCount: number;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onDownloadReport: () => void;
  onDownloadCasualtiesCSV: () => void;
  onDownloadAlertsCSV: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isMuted,
  onToggleMute,
  activeTab,
  onSelectTab,
  activeAlertCount,
  currentRole,
  onSelectRole,
  isDemoMode,
  onToggleDemoMode,
  onDownloadReport,
  onDownloadCasualtiesCSV,
  onDownloadAlertsCSV,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);

  const roles: { key: UserRole; label: string; desc: string }[] = [
    { key: 'ADMIN', label: 'Admin (Full Access)', desc: 'Configure hardware, AI thresholds, all permissions' },
    { key: 'FOREST_OFFICER', label: 'Forest Officer', desc: 'RRT dispatch, alert triage, incident logging' },
    { key: 'CONTROL_ROOM_OPERATOR', label: 'Control Room Operator', desc: 'Continuous camera surveillance & telemetry' },
    { key: 'RESEARCHER', label: 'Wildlife Researcher', desc: 'Analytics, conflict trends, academic data exports' },
    { key: 'VIEWER', label: 'Public / Field Viewer', desc: 'Read-only perimeter view & safety advisories' },
  ];

  return (
    <header id="surveillance-app-header" className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      {/* Topmost Tactical Telemetry Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            <span className="font-bold">24/7 SURVEILLANCE RUNNING</span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Demo Mode Badge (Upgrade 16) */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold transition-all ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
            title="Click to toggle Demo simulation / Live mode"
          >
            <span>{isDemoMode ? 'DEMO DATA ACTIVE' : 'LIVE TELEMETRY'}</span>
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>REGION: GUDALUR, NILGIRIS (TN)</span>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-1 text-slate-300">
            <Moon className="w-3 h-3 text-amber-400" />
            <span>IR SENSORS: 0.01-0.04 LUX</span>
          </div>
        </div>

        {/* User Role Switcher & Audio Mute (Upgrade 12) */}
        <div className="flex items-center gap-3">
          {/* Role selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors text-[11px]"
            >
              <UserCheck className="w-3 h-3 text-cyan-400" />
              <span>ROLE: {currentRole.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-sans space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
                  Switch Active Role (RBAC)
                </div>
                {roles.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      onSelectRole(r.key);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col ${
                      currentRole === r.key
                        ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-semibold">{r.label}</span>
                    <span className="text-[10px] text-slate-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-amber-300 hidden lg:flex items-center gap-1">
            <PhoneCall className="w-3 h-3" />
            <span>HOTLINE: 1800-425-4545</span>
          </div>

          <button
            id="btn-toggle-audio-siren"
            onClick={onToggleMute}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              isMuted
                ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-slate-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
            <span>{isMuted ? 'SIREN MUTED' : 'SIREN ACTIVE'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Nilgiris Wildlife Early Warning & Conflict Mitigation</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono hidden md:inline">
                CONTROL CENTER
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              AI-Powered Surveillance, Ingress Tracking & Rapid Response System • Gudalur Forest Division, Tamil Nadu
            </p>
          </div>
        </div>

        {/* Download Project Files & Datasets Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Project Files</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDownloadMenu && (
            <div className="absolute right-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
                Academic & Project Artifacts
              </div>

              <button
                onClick={() => {
                  onDownloadReport();
                  setShowDownloadMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2.5"
              >
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-100">Project Thesis Report (.md)</div>
                  <div className="text-[10px] text-slate-400">Comprehensive college report & SOP documentation</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onDownloadCasualtiesCSV();
                  setShowDownloadMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-100">Conflict Fatalities Dataset (.csv)</div>
                  <div className="text-[10px] text-slate-400">Recorded cases with GPS and low-light factors</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onDownloadAlertsCSV();
                  setShowDownloadMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2.5"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-100">RRT Dispatch Log (.csv)</div>
                  <div className="text-[10px] text-slate-400">Forest Department tickets & checkup logs</div>
                </div>
              </button>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setShowZipModal(true);
                    setShowDownloadMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-emerald-950/60 text-emerald-300 transition-colors flex items-center gap-2.5"
                >
                  <FolderArchive className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Full App Code (ZIP Instructions)</div>
                    <div className="text-[10px] text-emerald-400/80">How to export entire source code</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Upgrade 15: Complete 11-Tab Suite) */}
      <div className="bg-slate-900 border-t border-slate-800/80 px-4">
        <nav className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-700">
          {[
            { key: 'DASHBOARD', label: 'Dashboard', icon: Activity },
            { key: 'SURVEILLANCE', label: 'Live Cameras', icon: Camera },
            { key: 'MAP', label: 'Wildlife Map', icon: Layers },
            {
              key: 'FOREST_DISPATCH',
              label: 'Alerts',
              icon: ShieldAlert,
              badge: activeAlertCount > 0 ? activeAlertCount : undefined,
            },
            { key: 'INCIDENTS', label: 'Incidents', icon: FileText },
            { key: 'ANIMAL_ACTIVITY', label: 'Animal Activity', icon: Compass },
            { key: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
            { key: 'CASUALTIES', label: 'Research Archive', icon: Trees },
            { key: 'CAMERAS', label: 'Cameras', icon: Sliders },
            { key: 'SYSTEM_HEALTH', label: 'System Health', icon: Server },
            { key: 'FEED', label: 'Event Feed', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key as ActiveTabType)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-red-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ZIP Download Instructions Modal */}
      {showZipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Export Full Project ZIP</h3>
              </div>
              <button onClick={() => setShowZipModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                To download the entire application repository (including all TypeScript source files, React components, GIS datasets, and Vite config) for local execution in VS Code:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px] text-emerald-300">
                <div>1. In Google AI Studio, look at the upper-right corner.</div>
                <div>2. Click the <b>Menu (•••)</b> or <b>Settings</b> icon.</div>
                <div>3. Select <b>Export to ZIP</b> (or Export to GitHub).</div>
                <div>4. Extract the ZIP on your computer.</div>
                <div>5. Run <code className="text-amber-300">npm install</code> and <code className="text-amber-300">npm run dev</code>.</div>
              </div>
            </div>

            <button
              onClick={() => setShowZipModal(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
