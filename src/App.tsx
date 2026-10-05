import React, { useState } from 'react';
import {
  CameraNode,
  DetectionEvent,
  ForestDeptAlert,
  IncidentRecord,
  WildlifeSightingTrack,
  UserRole,
  SmartAlertStatus,
} from './types/surveillance';
import {
  DEFAULT_CAMERAS,
  HISTORICAL_CONFLICT_RECORDS,
  INITIAL_ALERTS,
  INITIAL_EVENTS,
  INITIAL_INCIDENTS,
  INITIAL_MOVEMENT_TRACKS,
} from './data/gudalurData';
import { HeaderBar, ActiveTabType } from './components/HeaderBar';
import { LiveCameraFeed } from './components/LiveCameraFeed';
import { GudalurMap } from './components/GudalurMap';
import { ForestDepartmentAlerts } from './components/ForestDepartmentAlerts';
import { ConflictIncidentArchive } from './components/ConflictIncidentArchive';
import { PersonalDashboardFeed } from './components/PersonalDashboardFeed';
import { IncidentManagement } from './components/IncidentManagement';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AnimalMovementTracker } from './components/AnimalMovementTracker';
import { SystemHealthView } from './components/SystemHealthView';
import { CameraInventory } from './components/CameraInventory';
import { ControlRoomDashboard } from './components/ControlRoomDashboard';
import { EvidenceViewerModal } from './components/EvidenceViewerModal';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  Info,
} from 'lucide-react';

export default function App() {
  const [cameras, setCameras] = useState<CameraNode[]>(DEFAULT_CAMERAS);
  const [activeCameraId, setActiveCameraId] = useState<string>('cam-my-personal');
  const [events, setEvents] = useState<DetectionEvent[]>(INITIAL_EVENTS);
  const [alerts, setAlerts] = useState<ForestDeptAlert[]>(INITIAL_ALERTS);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [movementTracks, setMovementTracks] = useState<WildlifeSightingTrack[]>(INITIAL_MOVEMENT_TRACKS);
  const [showCasualtyHotspots, setShowCasualtyHotspots] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('DASHBOARD');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Evidence modal inspector state
  const [evidenceModal, setEvidenceModal] = useState<{
    isOpen: boolean;
    title: string;
    species: string;
    confidence: number;
    timestamp: string;
    cameraName: string;
    location: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    boundingBoxes?: any[];
    humanPresence?: boolean;
    animalCount?: number;
    riskAssessment?: any;
    isDemoData?: boolean;
  }>({
    isOpen: false,
    title: '',
    species: '',
    confidence: 95,
    timestamp: '',
    cameraName: '',
    location: '',
    riskLevel: 'HIGH',
    isDemoData: true,
  });

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

      // Update movement track
      const newTrack: WildlifeSightingTrack = {
        id: `trk-${Date.now()}`,
        species: alert.species,
        location: alert.location,
        sector: event.sector,
        coordinates: event.coordinates,
        timestamp: event.timestamp,
        cameraId: event.cameraId,
        cameraName: event.cameraName,
        confidence: event.confidence,
        risk: (event.threatLevel === 'SAFE' ? 'LOW' : event.threatLevel) as any,
        direction: 'Direction heading into adjacent sector',
        sequenceOrder: movementTracks.length + 1,
        isDemoData: true,
      };
      setMovementTracks((prev) => [...prev, newTrack]);
    }

    // Update active camera state
    setCameras((prev) =>
      prev.map((c) =>
        c.id === event.cameraId
          ? {
              ...c,
              lastPing: 'Just now (Alert Active)',
              lastHeartbeat: 'Just now',
              detectionStatus: 'ANIMAL_DETECTED',
            }
          : c
      )
    );
  };

  // Handle Human Detected: Add to Personal Dashboard with NO Forest Dept Alert
  const handleHumanDetected = (event: DetectionEvent) => {
    setEvents((prev) => [event, ...prev]);
    setCameras((prev) =>
      prev.map((c) =>
        c.id === event.cameraId
          ? {
              ...c,
              lastPing: 'Just now (Human Detected - Safe)',
              lastHeartbeat: 'Just now',
              detectionStatus: 'CLEAR',
            }
          : c
      )
    );
  };

  // Handle Forest Dept Alert Status Update
  const handleUpdateAlertStatus = (ticketId: string, newStatus: SmartAlertStatus, notes?: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.ticketId === ticketId
          ? {
              ...a,
              status: newStatus,
              resolutionNotes: notes || a.resolutionNotes,
              acknowledgedAt: newStatus === 'ACKNOWLEDGED' ? new Date().toLocaleTimeString() : a.acknowledgedAt,
              acknowledgedBy: currentRole,
            }
          : a
      )
    );
  };

  // Handle Incidents
  const handleCreateIncident = (newIncident: IncidentRecord) => {
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const handleUpdateIncident = (updated: IncidentRecord) => {
    setIncidents((prev) => prev.map((inc) => (inc.id === updated.id ? updated : inc)));
  };

  // Handle Camera Online/Offline Toggle
  const handleToggleCameraStatus = (camId: string) => {
    setCameras((prev) =>
      prev.map((c) =>
        c.id === camId
          ? {
              ...c,
              status: c.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE',
            }
          : c
      )
    );
  };

  // Open Evidence Viewer Modal for any event or alert
  const handleViewEvidence = (item: any) => {
    setEvidenceModal({
      isOpen: true,
      title: item.species || item.animal || 'Camera Evidence Snapshot',
      species: item.species || item.animal || 'Wildlife Specimen',
      confidence: item.confidence || 96,
      timestamp: item.timestamp || item.dateTime || 'Just now',
      cameraName: item.cameraName || (cameras.find((c) => c.id === item.cameraId)?.name || 'Surveillance Node'),
      location: item.location || 'Gudalur Division',
      riskLevel: (item.threatLevel || item.riskLevel || item.severity || 'HIGH') as any,
      boundingBoxes: item.boundingBoxes || [
        {
          x: 32,
          y: 30,
          width: 38,
          height: 52,
          label: `${item.species || item.animal || 'Wildlife'} (${item.confidence || 95}%)`,
          confidence: item.confidence || 95,
          color: '#ef4444',
        },
      ],
      humanPresence: item.humanPresence,
      animalCount: item.animalCount || 1,
      riskAssessment: item.riskAssessment,
      isDemoData: item.isDemoData ?? true,
    });
  };

  const currentCamera = cameras.find((c) => c.id === activeCameraId) || cameras[0];
  const pendingAlertCount = alerts.filter(
    (a) => a.status !== 'ON_SITE_VERIFIED' && a.status !== 'RESOLVED' && a.status !== 'FALSE_POSITIVE'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header Navigation */}
      <HeaderBar
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeAlertCount={pendingAlertCount}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        onDownloadReport={() => downloadCollegeProjectReport(HISTORICAL_CONFLICT_RECORDS, alerts)}
        onDownloadCasualtiesCSV={() => downloadConflictDatasetCSV(HISTORICAL_CONFLICT_RECORDS)}
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

      {/* Global Demo Data Banner Notice (Upgrade 16) */}
      {isDemoMode && (
        <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-1 text-[11px] font-mono text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <strong>DEMO SIMULATION ACTIVE:</strong> Camera feeds, AI vision detections, alerts, and movement tracks are simulated for academic demonstration and testing.
            </span>
          </div>
          <span className="text-amber-400/80 hidden md:inline">
            Tamil Nadu Forest Dept Division: Gudalur • Nilgiris
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 0: CONTROL ROOM DASHBOARD (Upgrade 15) */}
        {activeTab === 'DASHBOARD' && (
          <ErrorBoundary moduleName="Control Room Command Dashboard">
            <ControlRoomDashboard
              cameras={cameras}
              activeCamera={currentCamera}
              onSelectCamera={(id) => {
                setActiveCameraId(id);
                setActiveTab('SURVEILLANCE');
              }}
              events={events}
              alerts={alerts}
              incidents={incidents}
              onNavigateTab={setActiveTab}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onAcknowledgeAlert={(ticketId) => handleUpdateAlertStatus(ticketId, 'ACKNOWLEDGED')}
              onViewEvidence={handleViewEvidence}
            />
          </ErrorBoundary>
        )}

        {/* TAB 1: SURVEILLANCE (Original Core View Preserved & Enhanced) */}
        {activeTab === 'SURVEILLANCE' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Live Camera Feed */}
              <div className="lg:col-span-7">
                <ErrorBoundary moduleName="Live Camera Surveillance Feed">
                  <LiveCameraFeed
                    currentCamera={currentCamera}
                    allCameras={cameras}
                    onSelectCamera={setActiveCameraId}
                    onAnimalDetected={handleAnimalDetected}
                    onHumanDetected={handleHumanDetected}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                    onViewEvidence={handleViewEvidence}
                  />
                </ErrorBoundary>
              </div>

              {/* Tactical Map of Gudalur */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="h-[380px] lg:h-full min-h-[380px]">
                  <ErrorBoundary moduleName="Gudalur Tactical Map Widget">
                    <GudalurMap
                      cameras={cameras}
                      activeCameraId={activeCameraId}
                      onSelectCamera={setActiveCameraId}
                      recentAlerts={alerts}
                      historicalCasualties={HISTORICAL_CONFLICT_RECORDS}
                      showCasualtyHotspots={showCasualtyHotspots}
                      onToggleCasualties={() => setShowCasualtyHotspots(!showCasualtyHotspots)}
                      movementTracks={movementTracks}
                      onViewEvidence={handleViewEvidence}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            </div>

            {/* Quick Personal Dashboard Stream & Forest Dept Alert Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorBoundary moduleName="Personal Event Stream">
                <PersonalDashboardFeed events={events} onSelectEvent={handleViewEvidence} />
              </ErrorBoundary>
              <ErrorBoundary moduleName="Forest Dept Alert Queue">
                <ForestDepartmentAlerts
                  alerts={alerts}
                  onUpdateStatus={handleUpdateAlertStatus}
                  onViewEvidence={handleViewEvidence}
                  onViewOnMap={(alert) => {
                    setActiveCameraId(alert.cameraId);
                    setActiveTab('MAP');
                  }}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* TAB 2: FULL TACTICAL GIS MAP */}
        {activeTab === 'MAP' && (
          <div className="space-y-4">
            <div className="h-[650px] w-full">
              <ErrorBoundary moduleName="Full Tactical GIS Map">
                <GudalurMap
                  cameras={cameras}
                  activeCameraId={activeCameraId}
                  onSelectCamera={setActiveCameraId}
                  recentAlerts={alerts}
                  historicalCasualties={HISTORICAL_CONFLICT_RECORDS}
                  showCasualtyHotspots={showCasualtyHotspots}
                  onToggleCasualties={() => setShowCasualtyHotspots(!showCasualtyHotspots)}
                  movementTracks={movementTracks}
                  onViewEvidence={handleViewEvidence}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* TAB 3: SMART FOREST DEPARTMENT DISPATCH CENTER */}
        {activeTab === 'FOREST_DISPATCH' && (
          <div className="space-y-4">
            <ErrorBoundary moduleName="Forest Dept Dispatch Portal">
              <ForestDepartmentAlerts
                alerts={alerts}
                onUpdateStatus={handleUpdateAlertStatus}
                onViewEvidence={handleViewEvidence}
                onViewOnMap={(alert) => {
                  setActiveCameraId(alert.cameraId);
                  setActiveTab('MAP');
                }}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* TAB 4: INCIDENT MANAGEMENT MODULE (Upgrade 8) */}
        {activeTab === 'INCIDENTS' && (
          <ErrorBoundary moduleName="Incident Management Module">
            <IncidentManagement
              incidents={incidents}
              onUpdateIncident={handleUpdateIncident}
              onCreateIncident={handleCreateIncident}
              onViewEvidence={handleViewEvidence}
              currentRole={currentRole}
            />
          </ErrorBoundary>
        )}

        {/* TAB 5: ANIMAL MOVEMENT HISTORY (Upgrade 6) */}
        {activeTab === 'ANIMAL_ACTIVITY' && (
          <ErrorBoundary moduleName="Wildlife Movement Tracker">
            <AnimalMovementTracker
              tracks={movementTracks}
              onViewOnMap={(track) => {
                setActiveCameraId(track.cameraId);
                setActiveTab('MAP');
              }}
            />
          </ErrorBoundary>
        )}

        {/* TAB 6: ADVANCED ANALYTICS (Upgrade 7) */}
        {activeTab === 'ANALYTICS' && (
          <ErrorBoundary moduleName="Surveillance Analytics Dashboard">
            <AnalyticsDashboard
              events={events}
              alerts={alerts}
              cameras={cameras}
              incidents={incidents}
            />
          </ErrorBoundary>
        )}

        {/* TAB 7: HUMAN CASUALTIES RESEARCH STUDY (Upgrade 14) */}
        {activeTab === 'CASUALTIES' && (
          <div className="space-y-4">
            <ErrorBoundary moduleName="Research Fatalities Archive">
              <ConflictIncidentArchive records={HISTORICAL_CONFLICT_RECORDS} />
            </ErrorBoundary>
          </div>
        )}

        {/* TAB 8: CAMERA SENSOR NETWORK (Upgrade 2) */}
        {activeTab === 'CAMERAS' && (
          <ErrorBoundary moduleName="Camera Telemetry Network">
            <CameraInventory
              cameras={cameras}
              onSelectCamera={(id) => {
                setActiveCameraId(id);
                setActiveTab('SURVEILLANCE');
              }}
              onToggleStatus={handleToggleCameraStatus}
            />
          </ErrorBoundary>
        )}

        {/* TAB 9: SYSTEM HEALTH & TELEMETRY (Upgrade 13) */}
        {activeTab === 'SYSTEM_HEALTH' && (
          <ErrorBoundary moduleName="System Health Telemetry">
            <SystemHealthView cameras={cameras} />
          </ErrorBoundary>
        )}

        {/* TAB 10: PERSONAL DASHBOARD EVENT FEED */}
        {activeTab === 'FEED' && (
          <div className="space-y-4">
            <ErrorBoundary moduleName="Event Feed Stream">
              <PersonalDashboardFeed events={events} onSelectEvent={handleViewEvidence} />
            </ErrorBoundary>
          </div>
        )}
      </main>

      {/* Evidence Viewer Modal (Upgrade 9) */}
      <EvidenceViewerModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal({ ...evidenceModal, isOpen: false })}
        title={evidenceModal.title}
        species={evidenceModal.species}
        confidence={evidenceModal.confidence}
        timestamp={evidenceModal.timestamp}
        cameraName={evidenceModal.cameraName}
        location={evidenceModal.location}
        riskLevel={evidenceModal.riskLevel}
        boundingBoxes={evidenceModal.boundingBoxes}
        humanPresence={evidenceModal.humanPresence}
        animalCount={evidenceModal.animalCount}
        isDemoData={evidenceModal.isDemoData}
        riskAssessment={evidenceModal.riskAssessment}
      />

      {/* Footer / Academic Attribution */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-4 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-slate-300 font-semibold flex items-center gap-2">
              <span>College Project: AI-Powered Wildlife Surveillance & Conflict Mitigation System</span>
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
