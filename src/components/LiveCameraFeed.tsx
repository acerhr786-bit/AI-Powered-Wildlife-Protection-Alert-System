import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraNode, DetectionEvent, ForestDeptAlert, BoundingBox } from '../types/surveillance';
import { PRESET_DEMO_SCENARIOS, PresetDemoScenario } from '../data/gudalurData';
import { audioAlert } from '../utils/audioAlert';
import { detectionService } from '../services/detectionService';
import { calculateWildlifeRisk } from '../services/riskEngine';
import { alertService } from '../services/alertService';
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
  Maximize2,
  Minimize2,
  Upload,
  Layers,
  FileVideo,
  Eye,
  Info,
} from 'lucide-react';

interface LiveCameraFeedProps {
  currentCamera: CameraNode;
  allCameras: CameraNode[];
  onSelectCamera: (camId: string) => void;
  onAnimalDetected: (event: DetectionEvent, alert?: ForestDeptAlert) => void;
  onHumanDetected: (event: DetectionEvent) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onViewEvidence?: (item: any) => void;
}

export const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({
  currentCamera,
  allCameras,
  onSelectCamera,
  onAnimalDetected,
  onHumanDetected,
  isMuted,
  onToggleMute,
  onViewEvidence,
}) => {
  // Feed source mode
  const [feedSource, setFeedSource] = useState<'WEBCAM' | 'UPLOAD_VIDEO' | 'IP_CCTV' | 'DEMO_STREAM'>('DEMO_STREAM');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [uploadedVideoSrc, setUploadedVideoSrc] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Low light / 24/7 vision mode (Upgrade 10)
  const [nightVisionMode, setNightVisionMode] = useState<'IR' | 'STARVIS' | 'THERMAL' | 'STANDARD'>('IR');
  const [brightnessBoost, setBrightnessBoost] = useState<number>(140); // %
  const [contrastBoost, setContrastBoost] = useState<number>(130); // %
  const [isGrayscaleIR, setIsGrayscaleIR] = useState<boolean>(true);
  const [currentLux, setCurrentLux] = useState<number>(0.02);

  // Detection & Bounding Box Overlay state (Upgrade 1 & 2)
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [autoContinuousScan, setAutoContinuousScan] = useState<boolean>(false);
  const [currentBoxes, setCurrentBoxes] = useState<BoundingBox[]>([
    {
      x: 30,
      y: 26,
      width: 44,
      height: 58,
      label: 'Asian Elephant (98%)',
      confidence: 98,
      color: '#ef4444',
    },
  ]);
  const [lastDetectionResult, setLastDetectionResult] = useState<{
    type: 'wild_animal' | 'human' | 'vehicle' | 'none' | null;
    species: string | null;
    confidence: number;
    details: string;
    forestAlertSent: boolean;
    ticketId?: string;
    timestamp?: string;
    animalCount?: number;
    humanNearby?: boolean;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskReason?: string;
  }>({
    type: 'wild_animal',
    species: 'Asian Elephant (Elephas maximus)',
    confidence: 98,
    details: 'Adult solitary tusker moving along tea plantation contour near O-Valley.',
    forestAlertSent: true,
    ticketId: 'TN-FD-GDL-2026-8812',
    timestamp: '22:14:08 IST',
    animalCount: 1,
    humanNearby: true,
    riskLevel: 'CRITICAL',
    riskReason: 'CRITICAL: Asian Elephant (1 animal) + Human detected in proximity + Nighttime (0.01 lux) in High-Conflict Zone.',
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

  // WebRTC Webcam startup
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
      setFeedSource('WEBCAM');

      const myCam = allCameras.find((c) => c.isPersonalCamera);
      if (myCam && currentCamera.id !== myCam.id) {
        onSelectCamera(myCam.id);
      }
    } catch (err: unknown) {
      console.warn('Webcam permission or device error:', err);
      setWebcamError('Camera hardware access unavailable. Operating in DEMO CAMERA Mode.');
      setFeedSource('DEMO_STREAM');
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
    setFeedSource('DEMO_STREAM');
  };

  // Video File Upload Handler (Upgrade 2)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedVideoSrc(url);
    setUploadedVideoName(file.name);
    setFeedSource('UPLOAD_VIDEO');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsWebcamActive(false);
    }
  };

  // Frame Capture for AI analysis
  const captureFrameBase64 = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  // Main Detection Runner
  const runDetection = useCallback(
    async (scenario?: PresetDemoScenario) => {
      if (isScanning) return;
      setIsScanning(true);

      try {
        const frameBase64 = isWebcamActive ? captureFrameBase64() : '';

        // Run modular detection service
        const event = scenario
          ? detectionService.generateSimulatedInference(currentCamera, scenario.id)
          : frameBase64
          ? await detectionService.analyzeFrame(frameBase64, currentCamera)
          : detectionService.generateSimulatedInference(currentCamera, 'demo-elephant-night');

        // Bounding boxes
        if (event.boundingBoxes && event.boundingBoxes.length > 0) {
          setCurrentBoxes(event.boundingBoxes);
        }

        // Logic check:
        if (event.detectedType === 'human') {
          audioAlert.playHumanSafeChirp();
          setLastDetectionResult({
            type: 'human',
            species: event.species,
            confidence: event.confidence,
            details: event.details,
            forestAlertSent: false,
            timestamp: event.timestamp,
            animalCount: 0,
            humanNearby: true,
            riskLevel: 'LOW',
            riskReason: event.riskAssessment?.reason,
          });
          onHumanDetected(event);
        } else if (event.detectedType === 'wild_animal' || event.detectedType === 'wild_animal_human_conflict') {
          audioAlert.playWildlifeAlarm();

          const alertRecord = alertService.createAlert({
            eventId: event.id,
            cameraId: currentCamera.id,
            cameraName: currentCamera.name,
            location: currentCamera.location,
            coordinates: currentCamera.coordinates,
            species: event.species || 'Wild Animal',
            threatLevel: (event.threatLevel === 'SAFE' ? 'LOW' : event.threatLevel) as any,
            confidence: event.confidence,
            riskAssessment: event.riskAssessment,
            humanPresence: event.humanPresence,
            animalCount: event.animalCount,
            isDemoData: event.isDemoData,
          });

          setLastDetectionResult({
            type: 'wild_animal',
            species: event.species,
            confidence: event.confidence,
            details: event.details,
            forestAlertSent: true,
            ticketId: alertRecord.ticketId,
            timestamp: event.timestamp,
            animalCount: event.animalCount || 1,
            humanNearby: event.humanPresence,
            riskLevel: (event.threatLevel === 'SAFE' ? 'LOW' : event.threatLevel) as any,
            riskReason: event.riskAssessment?.reason,
          });

          onAnimalDetected(event, alertRecord);
        } else {
          setLastDetectionResult({
            type: 'none',
            species: null,
            confidence: 85,
            details: 'Perimeter clear. No wildlife or human intrusions detected.',
            forestAlertSent: false,
            timestamp: event.timestamp,
            riskLevel: 'LOW',
          });
          setCurrentBoxes([]);
        }
      } catch (err) {
        console.error('Detection failure:', err);
      } finally {
        setIsScanning(false);
      }
    },
    [isScanning, isWebcamActive, captureFrameBase64, currentCamera, onAnimalDetected, onHumanDetected]
  );

  // Auto 24/7 continuous scan timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoContinuousScan) {
      interval = setInterval(() => {
        runDetection();
      }, 7000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoContinuousScan, runDetection]);

  // CSS Filter string for low-light night-vision enhancement (Upgrade 10)
  const getFilterStyle = (): string => {
    if (nightVisionMode === 'STANDARD') return 'none';
    if (nightVisionMode === 'THERMAL') {
      return `contrast(${contrastBoost + 20}%) brightness(${brightnessBoost}%) hue-rotate(180deg) saturate(200%)`;
    }
    if (nightVisionMode === 'STARVIS') {
      return `brightness(${brightnessBoost + 10}%) contrast(${contrastBoost + 15}%) saturate(85%)`;
    }
    // IR Night Vision
    const gray = isGrayscaleIR ? 'grayscale(100%)' : 'grayscale(60%)';
    return `${gray} brightness(${brightnessBoost}%) contrast(${contrastBoost}%) sepia(20%) hue-rotate(85deg)`;
  };

  return (
    <div
      id="live-camera-surveillance-module"
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Top Telemetry Ribbon */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE FEED:</span>
          </div>
          <span className="text-white font-bold tracking-tight">{currentCamera.name}</span>
          {feedSource === 'DEMO_STREAM' && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.2 rounded font-bold">
              DEMO CAMERA
            </span>
          )}
          {feedSource === 'WEBCAM' && (
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-2 py-0.2 rounded font-bold">
              WEBCAM (LIVE)
            </span>
          )}
          {feedSource === 'UPLOAD_VIDEO' && (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2 py-0.2 rounded font-bold">
              FILE: {uploadedVideoName}
            </span>
          )}
        </div>

        {/* Source Switchers & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            className="hidden"
            onChange={handleVideoUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors text-[11px]"
            title="Upload pre-recorded video clip or frame"
          >
            <Upload className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Upload Video</span>
          </button>

          {isWebcamActive ? (
            <button
              onClick={stopWebcam}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 rounded font-medium transition-colors text-[11px]"
            >
              <VideoOff className="w-3 h-3" />
              <span>Stop Webcam</span>
            </button>
          ) : (
            <button
              onClick={startWebcam}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 rounded font-medium transition-colors text-[11px]"
            >
              <Video className="w-3 h-3" />
              <span>Use Webcam</span>
            </button>
          )}

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Camera'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center select-none group">
        {/* Real video or Simulated canvas */}
        {feedSource === 'WEBCAM' ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ filter: getFilterStyle() }}
            className="w-full h-full object-cover"
          />
        ) : feedSource === 'UPLOAD_VIDEO' && uploadedVideoSrc ? (
          <video
            src={uploadedVideoSrc}
            controls
            autoPlay
            loop
            style={{ filter: getFilterStyle() }}
            className="w-full h-full object-contain"
          />
        ) : (
          /* Simulated Demo Camera Feed (Upgrade 16) */
          <div
            style={{ filter: getFilterStyle() }}
            className="w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
            
            {/* Background wildlife silhouette simulation */}
            <div className="text-center space-y-2 relative z-10 opacity-70">
              <Camera className="w-16 h-16 text-emerald-500/40 mx-auto" />
              <div className="text-sm font-bold text-slate-300 tracking-wider">
                {currentCamera.name}
              </div>
              <div className="text-xs font-mono text-slate-400">
                24/7 LOW-LIGHT CCTV MONITORING STREAM • {currentCamera.sector}
              </div>
              <div className="text-[11px] bg-slate-950/80 text-amber-300 font-mono px-3 py-1 rounded-full border border-amber-600/40 inline-block">
                DEMO CAMERA MODE ACTIVE (Hardware Emulation)
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Bounding Box Visual Overlays (Upgrade 1 & 2) */}
        {currentBoxes.map((box, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
              borderColor: box.color || '#ef4444',
            }}
            className="border-2 border-dashed rounded bg-red-500/10 pointer-events-none transition-all flex flex-col justify-start z-20"
          >
            <div
              style={{ backgroundColor: box.color || '#ef4444' }}
              className="text-black text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-br w-max uppercase flex items-center gap-1 shadow"
            >
              <span>{box.label}</span>
              <span>•</span>
              <span>{box.confidence}%</span>
            </div>
          </div>
        ))}

        {/* OSD HUD Elements */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20 font-mono">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-900/60 text-[11px] text-emerald-400 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-widest">
                  CAM_ID: {currentCamera.id.toUpperCase()}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-300">
                  {nightVisionMode === 'IR' ? '850nm IR NIGHT-VISION' : nightVisionMode}
                </span>
              </div>
              <div className="text-slate-400 text-[10px]">
                TIME: {osdTime || '2026-10-04 22:14:08.241'} IST
              </div>
            </div>

            <div className="bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-900/60 text-[11px] text-right space-y-0.5">
              <div className="text-slate-300 font-bold">
                SENSOR: {currentLux} LUX
              </div>
              <div className="text-emerald-400 text-[10px]">
                SOLAR: {currentCamera.batteryPercent}% ({currentCamera.solarStatus})
              </div>
            </div>
          </div>

          {/* Center Alert Notification Popups */}
          <div className="pointer-events-auto max-w-md mx-auto w-full">
            {lastDetectionResult.type === 'human' && (
              <div className="bg-cyan-950/95 border-2 border-cyan-500 text-cyan-100 p-3 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase text-white">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <span>HUMAN MOVEMENT DETECTED (SAFE)</span>
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded text-[10px]">
                    {lastDetectionResult.confidence}% CONF
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{lastDetectionResult.details}</p>
                <div className="mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-1 rounded">
                  ✓ POLICY ENFORCED: Forest Department dispatch suppressed for humans.
                </div>
              </div>
            )}

            {lastDetectionResult.type === 'wild_animal' && (
              <div className="bg-red-950/95 border-2 border-red-500 text-red-100 p-3 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                    <span className="font-bold text-xs uppercase text-white tracking-wide">
                      ⚠️ WILD ANIMAL INTRUSION CAPTURED
                    </span>
                  </div>
                  <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                    {lastDetectionResult.riskLevel || 'CRITICAL'} RISK
                  </span>
                </div>

                <div className="text-xs text-slate-200">
                  <strong>{lastDetectionResult.species}</strong> ({lastDetectionResult.confidence}% confidence)
                </div>

                {lastDetectionResult.riskReason && (
                  <p className="text-[11px] text-red-200 bg-black/40 p-2 rounded border border-red-900/60 leading-relaxed font-sans">
                    {lastDetectionResult.riskReason}
                  </p>
                )}

                <div className="text-[10px] font-bold text-amber-300 bg-black/70 border border-amber-600/70 p-2 rounded flex items-center justify-between">
                  <span>DISPATCH TICKET #{lastDetectionResult.ticketId}</span>
                  <span className="text-red-400">RRT Mobilized</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div className="flex items-end justify-between text-[10px] text-slate-400">
            <div className="bg-black/60 px-2 py-1 rounded">
              FOV: {currentCamera.fovAngle}° • FPS: 30 • 1080P
            </div>
            <div className="bg-black/60 px-2 py-1 rounded text-emerald-400">
              TAMIL NADU FOREST DEPT EARLY WARNING LINK: ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Low-Light Enhancements & Detection Triggers */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4">
        {/* Row 1: Low-Light Modes & Scan Triggers */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Night Vision Sensor Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Sensor Mode:
            </span>

            <button
              onClick={() => {
                setNightVisionMode('IR');
                setCurrentLux(0.01);
                setIsGrayscaleIR(true);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all ${
                nightVisionMode === 'IR'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              IR Night Vision (0.01 Lux)
            </button>

            <button
              onClick={() => {
                setNightVisionMode('STARVIS');
                setCurrentLux(0.04);
                setIsGrayscaleIR(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all ${
                nightVisionMode === 'STARVIS'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Starvis Low-Light
            </button>

            <button
              onClick={() => {
                setNightVisionMode('STANDARD');
                setCurrentLux(250);
                setIsGrayscaleIR(false);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                nightVisionMode === 'STANDARD'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Day RGB
            </button>
          </div>

          {/* Trigger Scan Buttons */}
          <div className="flex items-center gap-2">
            <button
              disabled={isScanning}
              onClick={() => runDetection()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Frame...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Scan Live Frame</span>
                </>
              )}
            </button>

            <button
              onClick={() => setAutoContinuousScan(!autoContinuousScan)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                autoContinuousScan
                  ? 'bg-red-950 text-red-300 border-red-700 ring-2 ring-red-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {autoContinuousScan ? '24/7 Scan ON' : 'Start 24/7 Auto-Scan'}
            </button>
          </div>
        </div>

        {/* Row 2: Low-Light Calibration Sliders (Upgrade 10) */}
        {nightVisionMode !== 'STANDARD' && (
          <div className="flex flex-wrap items-center gap-6 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Image Enhancements (Upgrade 10):
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px]">Brightness ({brightnessBoost}%):</span>
              <input
                type="range"
                min="100"
                max="250"
                value={brightnessBoost}
                onChange={(e) => setBrightnessBoost(Number(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px]">Contrast ({contrastBoost}%):</span>
              <input
                type="range"
                min="100"
                max="220"
                value={contrastBoost}
                onChange={(e) => setContrastBoost(Number(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-xs">
              <input
                type="checkbox"
                checked={isGrayscaleIR}
                onChange={(e) => setIsGrayscaleIR(e.target.checked)}
                className="rounded text-emerald-500"
              />
              <span>Grayscale IR Mode</span>
            </label>

            <span className="text-slate-400 text-[11px] italic ml-auto hidden md:inline">
              *Software low-light & Starvis contrast boost (Not FLIR thermal hardware).
            </span>
          </div>
        )}

        {/* Row 3: Preset Demonstration Scenarios (Upgrade 1 & 16) */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demonstration Scenarios [DEMO DATA Mode]:</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Simulates detection across all key wildlife species
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {PRESET_DEMO_SCENARIOS.map((sc) => {
              const isCrit = sc.threatLevel === 'CRITICAL';
              return (
                <button
                  key={sc.id}
                  disabled={isScanning}
                  onClick={() => runDetection(sc)}
                  className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between text-xs ${
                    isCrit
                      ? 'bg-red-950/30 hover:bg-red-950/60 border-red-900/50 hover:border-red-600'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white text-[11px] truncate">{sc.species}</div>
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                    <span className="text-slate-400">{sc.threatLevel}</span>
                    <span className="text-emerald-400 font-bold">Simulate →</span>
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
