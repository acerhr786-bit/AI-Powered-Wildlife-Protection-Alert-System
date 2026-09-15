import React, { useState } from 'react';
import { CameraNode, DetectionEvent, ForestDeptAlert } from './types/surveillance';
import {
  DEFAULT_CAMERAS,
  HISTORICAL_CONFLICT_RECORDS,
  INITIAL_ALERTS,
  INITIAL_EVENTS,
} from './data/gudalurData';
import { HeaderBar } from './components/HeaderBar';
import { LiveCameraFeed } from './components/LiveCameraFeed';
import { GudalurMap } from './components/GudalurMap';
import { ForestDepartmentAlerts } from './components/ForestDepartmentAlerts';
import { ConflictIncidentArchive } from './components/ConflictIncidentArchive';
import { PersonalDashboardFeed } from './components/PersonalDashboardFeed';
import { audioAlert } from './utils/audioAlert';
import {
  downloadCollegeProjectReport,
  downloadConflictDatasetCSV,
  downloadDispatchLogCSV,
} from './utils/exportUtils';
import {
  ShieldAlert,
  Send,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [cameras, setCameras] = useState<CameraNode[]>(DEFAULT_CAMERAS);
  const [activeCameraId, setActiveCameraId] = useState<string>('cam-my-personal');
  const [events, setEvents] = useState<DetectionEvent[]>(INITIAL_EVENTS);
  const [alerts, setAlerts] = useState<ForestDeptAlert[]>(INITIAL_ALERTS);
  const [showCasualtyHotspots, setShowCasualtyHotspots] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SURVEILLANCE' | 'MAP' | 'FOREST_DISPATCH' | 'CASUALTIES' | 'FEED'>('SURVEILLANCE');

  // Flash notification banner for newest wild animal alert
  const [latestWildAnimalNotification, setLatestWildAnimalNotification] = useState<{
    species: string;
    ticketId: string;
    location: string;
    timestamp: string;
  } | null>(null);

  // Toggle master audio
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioAlert.setMuted(nextMuted);
  };

  // Handle Animal Detected: Add to Personal Dashboard and Forest Dept Alerts
  const handleAnimalDetected = (event: DetectionEvent, alert?: ForestDeptAlert) => {
    setEvents((prev) => [event, ...prev]);

    if (alert) {
      setAlerts((prev) => [alert, ...prev]);
      setLatestWildAnimalNotification({
        species: alert.species,
        ticketId: alert.ticketId,
        location: alert.location,
        timestamp: alert.timestamp,
      });
    }

    // Update active camera in state if needed
    setCameras((prev) =>
      prev.map((c) =>
        c.id === event.cameraId ? { ...c, lastPing: 'Just now (Alert Active)' } : c
      )
    );
  };

  // Handle Human Detected: Add to Personal Dashboard with NO Forest Dept Alert
  const handleHumanDetected = (event: DetectionEvent) => {
    setEvents((prev) => [event, ...prev]);
  };

  // Handle Forest Dept Alert Status Update
  const handleUpdateAlertStatus = (ticketId: string, newStatus: ForestDeptAlert['status']) => {
    setAlerts((prev) =>
      prev.map((a) => (a.ticketId === ticketId ? { ...a, status: newStatus } : a))
    );
  };

  const currentCamera = cameras.find((c) => c.id === activeCameraId) || cameras[0];
  const pendingAlertCount = alerts.filter((a) => a.status !== 'ON_SITE_VERIFIED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header Navigation */}
      <HeaderBar
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeAlertCount={pendingAlertCount}
        onDownloadReport={() =>
          downloadCollegeProjectReport(HISTORICAL_CONFLICT_RECORDS, alerts)
        }
        onDownloadCasualtiesCSV={() =>
          downloadConflictDatasetCSV(HISTORICAL_CONFLICT_RECORDS)
        }
        onDownloadAlertsCSV={() => downloadDispatchLogCSV(alerts)}
      />

      {/* Emergency Flash Notification Banner (when wild animal triggers dispatch) */}
      {latestWildAnimalNotification && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-700 px-4 py-2.5 shadow-xl animate-fade-in flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
            <span className="font-bold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              WILD ANIMAL INTRUSION CAPTURED:
            </span>
            <span className="text-white font-semibold">{latestWildAnimalNotification.species}</span>
            <span className="text-red-200 hidden sm:inline">
              at {latestWildAnimalNotification.location} ({latestWildAnimalNotification.timestamp})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-black/40 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-600/50">
              DISPATCHED TICKET #{latestWildAnimalNotification.ticketId}
            </span>
            <button
              onClick={() => setActiveTab('FOREST_DISPATCH')}
              className="flex items-center gap-1 px-2.5 py-1 bg-white text-slate-950 font-bold rounded hover:bg-slate-200 transition-colors"
            >
              <span>View RRT Ticket</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setLatestWildAnimalNotification(null)}
              className="text-red-300 hover:text-white font-mono ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: SURVEILLANCE (Default View) */}
        {activeTab === 'SURVEILLANCE' && (
          <div className="space-y-6">
            {/* Split Screen: Live Camera & Map Side-by-Side or Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Live Camera Feed (7 cols on large) */}
              <div className="lg:col-span-7">
                <LiveCameraFeed
                  currentCamera={currentCamera}
                  allCameras={cameras}
                  onSelectCamera={setActiveCameraId}
                  onAnimalDetected={handleAnimalDetected}
                  onHumanDetected={handleHumanDetected}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                />
              </div>

              {/* Tactical Map of Gudalur (5 cols on large) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="h-[380px] lg:h-full min-h-[380px]">
                  <GudalurMap
                    cameras={cameras}
                    activeCameraId={activeCameraId}
                    onSelectCamera={setActiveCameraId}
                    recentAlerts={alerts}
                    historicalCasualties={HISTORICAL_CONFLICT_RECORDS}
                    showCasualtyHotspots={showCasualtyHotspots}
                    onToggleCasualties={() => setShowCasualtyHotspots(!showCasualtyHotspots)}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Quick Personal Dashboard Stream & Forest Dept Alert Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PersonalDashboardFeed events={events} />
              <ForestDepartmentAlerts
                alerts={alerts}
                onUpdateStatus={handleUpdateAlertStatus}
              />
            </div>
          </div>
        )}

        {/* TAB 2: FULL TACTICAL MAP */}
        {activeTab === 'MAP' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  Nilgiris Gudalur Tactical Surveillance Grid
                </h3>
                <p className="text-slate-400">
                  Real GPS coordinates of CCTV cameras, elephant migration corridors, and human-wildlife fatality records.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCasualtyHotspots(!showCasualtyHotspots)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                    showCasualtyHotspots
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {showCasualtyHotspots ? 'Fatality Hotspots ON' : 'Show Fatality Hotspots'}
                </button>
              </div>
            </div>

            <div className="h-[600px] w-full">
              <GudalurMap
                cameras={cameras}
                activeCameraId={activeCameraId}
                onSelectCamera={setActiveCameraId}
                recentAlerts={alerts}
                historicalCasualties={HISTORICAL_CONFLICT_RECORDS}
                showCasualtyHotspots={showCasualtyHotspots}
                onToggleCasualties={() => setShowCasualtyHotspots(!showCasualtyHotspots)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: FOREST DEPARTMENT DISPATCH CENTER */}
        {activeTab === 'FOREST_DISPATCH' && (
          <div className="space-y-4">
            <ForestDepartmentAlerts
              alerts={alerts}
              onUpdateStatus={handleUpdateAlertStatus}
            />
          </div>
        )}

        {/* TAB 4: HUMAN CASUALTIES RESEARCH STUDY */}
        {activeTab === 'CASUALTIES' && (
          <div className="space-y-4">
            <ConflictIncidentArchive records={HISTORICAL_CONFLICT_RECORDS} />
          </div>
        )}

        {/* TAB 5: PERSONAL DASHBOARD EVENT FEED */}
        {activeTab === 'FEED' && (
          <div className="space-y-4">
            <PersonalDashboardFeed events={events} />
          </div>
        )}
      </main>

      {/* Footer / Academic Attribution */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-4 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-slate-300 font-semibold flex items-center gap-2">
              <span>College Project: Human-Wildlife Conflict Early Warning Surveillance System</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">Nilgiris Gudalur Division</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Surveillance Protocol: Humans logged as Safe (Alerts Suppressed) • Wild Animals trigger automated Forest Department RRT personal checkup dispatch.
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 text-right">
            24/7 Low-Light Starvis & Infrared Monitoring • Tamil Nadu Forest Department Link
          </div>
        </div>
      </footer>
    </div>
  );
}
