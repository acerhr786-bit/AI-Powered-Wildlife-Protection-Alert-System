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
} from 'lucide-react';

interface HeaderBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  activeTab: 'SURVEILLANCE' | 'MAP' | 'FOREST_DISPATCH' | 'CASUALTIES' | 'FEED';
  onSelectTab: (tab: 'SURVEILLANCE' | 'MAP' | 'FOREST_DISPATCH' | 'CASUALTIES' | 'FEED') => void;
  activeAlertCount: number;
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
  onDownloadReport,
  onDownloadCasualtiesCSV,
  onDownloadAlertsCSV,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);
  return (
    <header id="surveillance-app-header" className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      {/* Topmost Tactical Telemetry Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            <span className="font-bold">24/7 SURVEILLANCE RUNNING</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>REGION: GUDALUR, NILGIRIS (TN)</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <Moon className="w-3 h-3 text-amber-400" />
            <span>NIGHT-VISION SENSORS: 0.01-0.04 LUX</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-amber-300 flex items-center gap-1">
            <PhoneCall className="w-3 h-3" />
            <span>FOREST DEPT HOTLINE: 1800-425-4545</span>
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

      {/* Main App Title & Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Nilgiris Wildlife Early Warning & Conflict Mitigation</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono hidden md:inline">
                COLLEGE PROJECT
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Automated CCTV & Personal Camera 24/7 AI Surveillance • Gudalur Division, Tamil Nadu
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            id="tab-surveillance"
            onClick={() => onSelectTab('SURVEILLANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'SURVEILLANCE'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Live Camera & AI Feed
          </button>

          <button
            id="tab-map"
            onClick={() => onSelectTab('MAP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'MAP'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Gudalur Tactical Map
          </button>

          <button
            id="tab-forest-dispatch"
            onClick={() => onSelectTab('FOREST_DISPATCH')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FOREST_DISPATCH'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Forest Dept Dispatch</span>
            {activeAlertCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {activeAlertCount}
              </span>
            )}
          </button>

          <button
            id="tab-casualties"
            onClick={() => onSelectTab('CASUALTIES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'CASUALTIES'
                ? 'bg-rose-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Human Casualties Research
          </button>

          <button
            id="tab-feed"
            onClick={() => onSelectTab('FEED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'FEED'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            My Event Log
          </button>

          {/* Download Project Files Dropdown */}
          <div className="relative">
            <button
              id="btn-download-menu"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Files</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showDownloadMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDownloadMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    Project Downloads & Reports
                  </div>

                  <button
                    id="btn-dl-report"
                    onClick={() => {
                      onDownloadReport();
                      setShowDownloadMenu(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">Project Thesis Report (.md)</div>
                      <div className="text-[10px] text-slate-400">Full college research report & specs</div>
                    </div>
                  </button>

                  <button
                    id="btn-dl-casualties-csv"
                    onClick={() => {
                      onDownloadCasualtiesCSV();
                      setShowDownloadMenu(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">Fatalities Dataset (.csv)</div>
                      <div className="text-[10px] text-slate-400">Gudalur conflict records & GPS</div>
                    </div>
                  </button>

                  <button
                    id="btn-dl-alerts-csv"
                    onClick={() => {
                      onDownloadAlertsCSV();
                      setShowDownloadMenu(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-100">Dispatch Tickets Log (.csv)</div>
                      <div className="text-[10px] text-slate-400">Forest Dept alerts & SOP tickets</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  <button
                    id="btn-dl-app-source-zip"
                    onClick={() => {
                      setShowZipModal(true);
                      setShowDownloadMenu(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-emerald-950/40 text-left text-emerald-300 transition-colors"
                  >
                    <FolderArchive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-emerald-300">Download App Source (ZIP)</div>
                      <div className="text-[10px] text-emerald-500">Export complete codebase</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Modal: How to Download App Source ZIP */}
      {showZipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <FolderArchive className="w-5 h-5" />
                <span>Export & Download Codebase (ZIP)</span>
              </div>
              <button
                onClick={() => setShowZipModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                To download the <strong>complete application code</strong> as a ZIP file to your computer:
              </p>
              <ol className="list-decimal list-inside space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                <li>
                  Look at the <strong>top-right corner of Google AI Studio</strong>.
                </li>
                <li>
                  Click on the <strong>Settings / Menu</strong> icon (gear or <strong>•••</strong> icon).
                </li>
                <li>
                  Select <strong>"Export to ZIP"</strong> (or <strong>"Export to GitHub"</strong>).
                </li>
                <li>Your browser will instantly download the complete repository ZIP file containing all source files, models, and dependencies.</li>
              </ol>

              <div className="bg-emerald-950/60 border border-emerald-800/80 p-2.5 rounded-lg text-[11px] text-emerald-300">
                💡 <strong>Tip:</strong> You can also download the project report (.md) or conflict dataset (.csv) instantly from the <strong>Download Files</strong> menu above!
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowZipModal(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
