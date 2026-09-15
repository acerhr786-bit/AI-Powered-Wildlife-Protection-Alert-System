import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraNode, DetectionEvent, ForestDeptAlert } from '../types/surveillance';
import { PRESET_DEMO_SCENARIOS, PresetDemoScenario } from '../data/gudalurData';
import { audioAlert } from '../utils/audioAlert';
import {
  Camera,
  Video,
  VideoOff,
  Moon,
  Sun,
  Flame,
  Scan,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Send,
  Sparkles,
  RefreshCw,
  Activity,
  Sliders,
  Radio,
  Zap,
} from 'lucide-react';

interface LiveCameraFeedProps {
  currentCamera: CameraNode;
  allCameras: CameraNode[];
  onSelectCamera: (camId: string) => void;
  onAnimalDetected: (event: DetectionEvent, alert?: ForestDeptAlert) => void;
  onHumanDetected: (event: DetectionEvent) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({
  currentCamera,
  allCameras,
  onSelectCamera,
  onAnimalDetected,
  onHumanDetected,
  isMuted,
  onToggleMute,
}) => {
  // Webcam state
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Low light / 24/7 vision mode
  const [nightVisionMode, setNightVisionMode] = useState<'IR' | 'STARVIS' | 'THERMAL' | 'STANDARD'>('IR');
  const [brightnessBoost, setBrightnessBoost] = useState<number>(140); // %
  const [contrastBoost, setContrastBoost] = useState<number>(130); // %
  const [currentLux, setCurrentLux] = useState<number>(0.02);

  // Analysis / Detection state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [autoContinuousScan, setAutoContinuousScan] = useState<boolean>(false);
  const [lastDetectionResult, setLastDetectionResult] = useState<{
    type: 'wild_animal' | 'human' | 'none' | null;
    species: string | null;
    confidence: number;
    details: string;
    forestAlertSent: boolean;
    ticketId?: string;
    timestamp?: string;
  }>({
    type: null,
    species: null,
    confidence: 0,
    details: '',
    forestAlertSent: false,
  });

  // 24/7 OSD clock
  const [osdTime, setOsdTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setOsdTime(
        now.toISOString().replace('T', ' ').substring(0, 19) +
          '.' +
          String(now.getMilliseconds()).padStart(3, '0')
      );
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // WebRTC Camera startup
  const startWebcam = async () => {
    setWebcamError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsWebcamActive(true);

      // If user wasn't on My Personal Camera, select it
      const myCam = allCameras.find((c) => c.isPersonalCamera);
      if (myCam && currentCamera.id !== myCam.id) {
        onSelectCamera(myCam.id);
      }
    } catch (err: unknown) {
      console.warn('Webcam permission / device error:', err);
      const errMsg = err instanceof Error ? err.message : 'Webcam access denied or unavailable';
      setWebcamError(errMsg);
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    setAutoContinuousScan(false);
  };

  // Clean up webcam on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Capture frame from webcam or canvas
  const captureFrameBase64 = (): string | null => {
    if (!videoRef.current || !isWebcamActive) return null;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Apply low light filter transform if IR or thermal
    if (nightVisionMode === 'IR') {
      ctx.filter = `grayscale(100%) contrast(${contrastBoost}%) brightness(${brightnessBoost}%)`;
    } else if (nightVisionMode === 'STARVIS') {
      ctx.filter = `contrast(120%) brightness(${brightnessBoost + 20}%) saturate(140%)`;
    } else {
      ctx.filter = `contrast(${contrastBoost}%) brightness(${brightnessBoost}%)`;
    }

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Process AI Detection (Live or Scenario)
  const runDetection = useCallback(
    async (scenario?: PresetDemoScenario) => {
      if (isScanning) return;
      setIsScanning(true);

      try {
        let payload: Record<string, unknown> = {};

        if (scenario) {
          payload = {
            scenarioId: scenario.id,
            isLowLightMode: scenario.isLowLight,
            cameraName: currentCamera.name,
            sector: currentCamera.sector,
          };
        } else {
          const frameBase64 = captureFrameBase64();
          payload = {
            imageBase64: frameBase64,
            isLowLightMode: nightVisionMode !== 'STANDARD',
            cameraName: currentCamera.name,
            sector: currentCamera.sector,
          };
        }

        const res = await fetch('/api/analyze-frame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        // 1. HUMAN DETECTED:
        if (data.detected === 'human') {
          audioAlert.playHumanSafeChirp();

          const event: DetectionEvent = {
            id: `evt-${Date.now()}`,
            cameraId: currentCamera.id,
            cameraName: currentCamera.name,
            location: currentCamera.location,
            sector: currentCamera.sector,
            coordinates: currentCamera.coordinates,
            timestamp: new Date().toLocaleTimeString(),
            detectedType: 'human',
            species: data.species || 'Human (Villager / Estate Worker)',
            confidence: data.confidence || 95,
            isLowLight: nightVisionMode !== 'STANDARD',
            luxLevel: currentLux,
            threatLevel: 'SAFE',
            forestDeptAlertRequired: false, // STRICT RULE: NO ALERT TO FOREST DEPT
            alertStatus: 'NOT_REQUIRED',
            details: data.details || 'Human movement detected in camera view. Verified safe. Forest alert suppressed.',
            suggestedAction: 'Routine observation. No Forest Department dispatch required.',
            source: currentCamera.isPersonalCamera ? 'my_camera' : 'cctv_network',
          };

          setLastDetectionResult({
            type: 'human',
            species: event.species,
            confidence: event.confidence,
            details: event.details,
            forestAlertSent: false,
            timestamp: event.timestamp,
          });

          onHumanDetected(event);
        }
        // 2. WILD ANIMAL DETECTED:
        else if (data.detected === 'wild_animal' || data.detected === 'wild_animal_human_conflict') {
          audioAlert.playWildlifeAlarm();

          // Auto-dispatch Forest Department alert
          const dispatchRes = await fetch('/api/forest-dept-dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cameraId: currentCamera.id,
              cameraName: currentCamera.name,
              species: data.species || 'Wild Animal (Tiger / Elephant / Leopard)',
              threatLevel: data.threat_level || 'CRITICAL',
              exactCoordinates: `${currentCamera.coordinates[0].toFixed(4)}° N, ${currentCamera.coordinates[1].toFixed(4)}° E`,
              location: currentCamera.location,
              suggestedAction: data.suggested_action,
            }),
          });

          const dispatchData = await dispatchRes.json();
          const alertRecord: ForestDeptAlert = dispatchData.alert;

          const event: DetectionEvent = {
            id: `evt-${Date.now()}`,
            cameraId: currentCamera.id,
            cameraName: currentCamera.name,
            location: currentCamera.location,
            sector: currentCamera.sector,
            coordinates: currentCamera.coordinates,
            timestamp: new Date().toLocaleTimeString(),
            detectedType: 'wild_animal',
            species: data.species || 'Wild Animal',
            confidence: data.confidence || 96,
            isLowLight: nightVisionMode !== 'STANDARD',
            luxLevel: currentLux,
            threatLevel: data.threat_level || 'CRITICAL',
            forestDeptAlertRequired: true, // STRICT RULE: ALERT FOREST DEPT FOR PERSONAL CHECKUP
            alertStatus: 'DISPATCHED',
            dispatchTicketId: alertRecord?.ticketId,
            details: data.details || 'Wild animal intrusion captured in camera zone. Automated alert forwarded to Forest Dept RRT.',
            suggestedAction: data.suggested_action || 'Field patrol team mobilized for personal checkup.',
            source: currentCamera.isPersonalCamera ? 'my_camera' : 'cctv_network',
          };

          setLastDetectionResult({
            type: 'wild_animal',
            species: event.species,
            confidence: event.confidence,
            details: event.details,
            forestAlertSent: true,
            ticketId: alertRecord?.ticketId,
            timestamp: event.timestamp,
          });

          onAnimalDetected(event, alertRecord);
        } else {
          // None / clear
          setLastDetectionResult({
            type: 'none',
            species: null,
            confidence: 90,
            details: 'Scan clear. No animal or human threat detected in camera field of view.',
            forestAlertSent: false,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      } catch (err) {
        console.error('Detection analysis error:', err);
      } finally {
        setIsScanning(false);
      }
    },
    [
      isScanning,
      currentCamera,
      nightVisionMode,
      contrastBoost,
      brightnessBoost,
      currentLux,
      onAnimalDetected,
      onHumanDetected,
    ]
  );

  // 24/7 continuous automatic scan loop when enabled
  useEffect(() => {
    if (!autoContinuousScan) return;
    const interval = setInterval(() => {
      runDetection();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoContinuousScan, runDetection]);

  // Compute CSS filter string for live video feed
  const getVideoFilter = () => {
    if (nightVisionMode === 'IR') {
      return `grayscale(100%) contrast(${contrastBoost}%) brightness(${brightnessBoost}%) drop-shadow(0 0 1px #22c55e)`;
    } else if (nightVisionMode === 'STARVIS') {
      return `contrast(${contrastBoost}%) brightness(${brightnessBoost + 15}%) saturate(135%)`;
    } else if (nightVisionMode === 'THERMAL') {
      return `contrast(180%) brightness(120%) hue-rotate(180deg) invert(100%)`;
    }
    return `contrast(105%) brightness(105%)`;
  };

  return (
    <div id="live-camera-surveillance-feed" className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Camera Switcher & Status Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>{currentCamera.name}</span>
              {currentCamera.isPersonalCamera && (
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-700 text-[10px] px-2 py-0.2 rounded font-mono font-semibold">
                  ★ MY CAMERA
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {currentCamera.sector} • GPS: {currentCamera.coordinates[0].toFixed(4)}° N, {currentCamera.coordinates[1].toFixed(4)}° E
            </div>
          </div>
        </div>

        {/* Camera Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {allCameras.map((cam) => {
            const isSelected = cam.id === currentCamera.id;
            return (
              <button
                key={cam.id}
                id={`btn-select-${cam.id}`}
                onClick={() => onSelectCamera(cam.id)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold ring-1 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {cam.isPersonalCamera ? '★ My Camera' : cam.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Viewport Window */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden select-none">
        {/* Real Live Webcam Feed or Simulated 24/7 Trail Cam */}
        {isWebcamActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ filter: getVideoFilter() }}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div
            style={{ filter: getVideoFilter() }}
            className="relative w-full h-full flex items-center justify-center bg-radial from-slate-900 to-black p-6"
          >
            {/* Background simulated forest tea estate silhouette for testing */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="text-center z-10 max-w-md space-y-3 bg-slate-950/80 p-6 rounded-xl border border-slate-800 backdrop-blur-md">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-600/40 text-cyan-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-100">
                  {currentCamera.isPersonalCamera ? 'My Personal Camera (Field Post)' : currentCamera.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {currentCamera.isPersonalCamera
                    ? 'Connect your personal laptop or mobile camera for real-time 24/7 AI monitoring and low-light detection.'
                    : 'Network CCTV node active in Gudalur forest corridor. Analyzing sensor telemetry.'}
                </p>
              </div>

              {currentCamera.isPersonalCamera ? (
                <button
                  id="btn-start-my-webcam"
                  onClick={startWebcam}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Start My Camera (Webcam Feed)</span>
                </button>
              ) : (
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/50 py-1.5 px-3 rounded border border-emerald-800">
                  ● 24/7 CCTV Feed Connected via Nilgiris Forest Mesh Network
                </div>
              )}

              {webcamError && (
                <div className="text-xs text-rose-400 bg-rose-950/60 p-2 rounded border border-rose-800">
                  {webcamError} (You can still run presets below)
                </div>
              )}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* 24/7 Surveillance On-Screen Display (OSD) Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-xs font-mono text-emerald-400/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {/* OSD Top Row */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 bg-black/60 backdrop-blur-sm p-2 rounded border border-emerald-900/40">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping"></span>
                <span className="text-red-400">REC 24/7</span>
                <span className="text-slate-200">|</span>
                <span className="text-emerald-300">{currentCamera.name}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                SENSOR: {nightVisionMode} MODE • LUX: {currentLux} • FPS: 30
              </div>
              <div className="text-[10px] text-slate-400">
                SECTOR: {currentCamera.sector}
              </div>
            </div>

            <div className="text-right bg-black/60 backdrop-blur-sm p-2 rounded border border-emerald-900/40">
              <div className="font-bold text-slate-100">{osdTime || '2026-09-10 03:41:19.421'}</div>
              <div className="text-[11px] text-amber-300 font-semibold">
                NILGIRIS GUDALUR CORRIDOR
              </div>
              <div className="text-[10px] text-slate-400">BATTERY: {currentCamera.batteryPercent}% (SOLAR/IR)</div>
            </div>
          </div>

          {/* Tactical Crosshair / Bounding Box Grid */}
          <div className="absolute inset-x-12 inset-y-12 border border-emerald-500/20 pointer-events-none flex items-center justify-center">
            <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400/60 absolute top-0 left-0"></div>
            <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400/60 absolute top-0 right-0"></div>
            <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400/60 absolute bottom-0 left-0"></div>
            <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400/60 absolute bottom-0 right-0"></div>

            {/* Crosshair Center */}
            <div className="w-4 h-0.5 bg-emerald-400/40"></div>
            <div className="h-4 w-0.5 bg-emerald-400/40 absolute"></div>

            {/* Active Detection Visual Banner inside HUD */}
            {lastDetectionResult.type === 'human' && (
              <div className="absolute inset-x-6 top-8 bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 p-3 rounded-lg backdrop-blur-md shadow-2xl pointer-events-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-sm tracking-wide text-white uppercase">
                      HUMAN DETECTED: {lastDetectionResult.species}
                    </span>
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded text-[11px]">
                    {lastDetectionResult.confidence}% CONFIDENCE
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-slate-300">
                  {lastDetectionResult.details}
                </div>
                <div className="mt-2 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-1 rounded flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>POLICY ENFORCED: Forest Department Alert Suppressed (Human only - No false alert dispatched).</span>
                </div>
              </div>
            )}

            {lastDetectionResult.type === 'wild_animal' && (
              <div className="absolute inset-x-6 top-8 bg-red-950/95 border-2 border-red-500 text-red-100 p-3 rounded-lg backdrop-blur-md shadow-2xl animate-pulse pointer-events-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
                    <span className="font-bold text-sm tracking-wider text-white uppercase">
                      ⚠️ CRITICAL ALERT: WILD ANIMAL CAPTURED
                    </span>
                  </div>
                  <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                    SPECIES: {lastDetectionResult.species}
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-red-200">
                  {lastDetectionResult.details}
                </div>
                <div className="mt-2 text-[11px] font-bold text-amber-300 bg-black/70 border border-amber-600/70 px-2 py-1 rounded flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>AUTOMATIC FOREST DEPARTMENT DISPATCH ACTIVE: Ticket #{lastDetectionResult.ticketId}</span>
                  </div>
                  <span className="text-red-400">RRT Mobilized</span>
                </div>
              </div>
            )}
          </div>

          {/* OSD Bottom Row */}
          <div className="flex items-end justify-between">
            <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-900/40 text-[11px] text-slate-300">
              FIELD OF VIEW: {currentCamera.fovAngle}° • ENCRYPTION: AES-256 MESH
            </div>

            <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-900/40 text-[11px] text-emerald-300 font-semibold">
              TAMIL NADU FOREST DEPT EARLY WARNING LINK: ACTIVE
            </div>
          </div>
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-x-0 h-1 bg-emerald-500/30 blur-xs animate-scanline pointer-events-none"></div>
      </div>

      {/* Control Panel: Night Vision Filters & AI Detection Trigger */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4">
        {/* Row 1: Low Light Sensor Modes & Live Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Night Vision Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Low Light Sensor:
            </span>

            <button
              id="mode-ir-night"
              onClick={() => {
                setNightVisionMode('IR');
                setCurrentLux(0.01);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all ${
                nightVisionMode === 'IR'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              IR Night Vision (0.01 Lux)
            </button>

            <button
              id="mode-starvis"
              onClick={() => {
                setNightVisionMode('STARVIS');
                setCurrentLux(0.04);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all ${
                nightVisionMode === 'STARVIS'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Starvis Low-Light
            </button>

            <button
              id="mode-thermal"
              onClick={() => {
                setNightVisionMode('THERMAL');
                setCurrentLux(0.005);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all ${
                nightVisionMode === 'THERMAL'
                  ? 'bg-amber-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Thermal Vision
            </button>

            <button
              id="mode-standard"
              onClick={() => {
                setNightVisionMode('STANDARD');
                setCurrentLux(250);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                nightVisionMode === 'STANDARD'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Standard RGB
            </button>
          </div>

          {/* Primary AI Scan & Continuous Monitor Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-ai-scan"
              disabled={isScanning}
              onClick={() => runDetection()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-950 transition-all cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Frame...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Scan Live Camera Now</span>
                </>
              )}
            </button>

            <button
              id="btn-toggle-continuous-scan"
              onClick={() => setAutoContinuousScan(!autoContinuousScan)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                autoContinuousScan
                  ? 'bg-red-950 text-red-300 border-red-700 ring-2 ring-red-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {autoContinuousScan ? '24/7 Auto-Scan ON' : 'Start 24/7 Auto-Scan'}
            </button>

            {isWebcamActive ? (
              <button
                id="btn-stop-webcam"
                onClick={stopWebcam}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-medium rounded-lg transition-colors"
              >
                <VideoOff className="w-3.5 h-3.5" />
                Stop Camera
              </button>
            ) : (
              <button
                id="btn-use-my-camera"
                onClick={startWebcam}
                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-medium rounded-lg transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                Use My Camera
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Low-Light Image Calibration Sliders (Contrast / Brightness) */}
        {nightVisionMode !== 'STANDARD' && (
          <div className="flex flex-wrap items-center gap-6 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Night Sensor Gain Calibration:
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Brightness ({brightnessBoost}%):</span>
              <input
                type="range"
                min="100"
                max="250"
                value={brightnessBoost}
                onChange={(e) => setBrightnessBoost(Number(e.target.value))}
                className="w-28 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Contrast ({contrastBoost}%):</span>
              <input
                type="range"
                min="100"
                max="220"
                value={contrastBoost}
                onChange={(e) => setContrastBoost(Number(e.target.value))}
                className="w-28 accent-emerald-500 cursor-pointer"
              />
            </div>

            <span className="text-emerald-400/80 font-mono text-[11px] ml-auto">
              Optimized for Nilgiris Pitch-Black Night Conditions (0.01 - 0.05 Lux)
            </span>
          </div>
        )}

        {/* Row 3: Preset Demonstration Scenarios (Crucial for testing the logic!) */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>College Project Demonstration Scenarios (Test User Intent Rules):</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Simulates low-light sensor captures in Gudalur Division
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {PRESET_DEMO_SCENARIOS.map((scenario) => {
              const isAnimal = scenario.animalOrHuman === 'wild_animal';
              return (
                <button
                  key={scenario.id}
                  id={`btn-demo-${scenario.id}`}
                  disabled={isScanning}
                  onClick={() => runDetection(scenario)}
                  className={`p-2 rounded-lg border text-left transition-all group flex flex-col justify-between ${
                    isAnimal
                      ? 'bg-red-950/30 hover:bg-red-950/60 border-red-900/50 hover:border-red-600'
                      : 'bg-cyan-950/30 hover:bg-cyan-950/60 border-cyan-900/50 hover:border-cyan-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={isAnimal ? 'text-red-400' : 'text-cyan-400'}>
                        {scenario.name}
                      </span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          isAnimal ? 'bg-red-900 text-red-200' : 'bg-cyan-900 text-cyan-200'
                        }`}
                      >
                        {isAnimal ? 'ALERT FOREST' : 'HUMAN (NO ALERT)'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>{scenario.isLowLight ? '🌙 Low-Light IR' : '☀️ Daylight'}</span>
                    <span className={isAnimal ? 'text-amber-400' : 'text-emerald-400'}>Test Logic →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
