import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CameraNode, ConflictIncidentRecord, ForestDeptAlert } from '../types/surveillance';
import { GUDALUR_CENTER } from '../data/gudalurData';
import { MapPin, Navigation, ShieldAlert, Eye, Radio } from 'lucide-react';

interface GudalurMapProps {
  cameras: CameraNode[];
  activeCameraId: string;
  onSelectCamera: (camId: string) => void;
  recentAlerts: ForestDeptAlert[];
  historicalCasualties: ConflictIncidentRecord[];
  showCasualtyHotspots: boolean;
  onToggleCasualties: () => void;
}

export const GudalurMap: React.FC<GudalurMapProps> = ({
  cameras,
  activeCameraId,
  onSelectCamera,
  recentAlerts,
  historicalCasualties,
  showCasualtyHotspots,
  onToggleCasualties,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const casualtiesLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: GUDALUR_CENTER,
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark high-contrast carto tiles suitable for 24/7 surveillance monitoring
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    casualtiesLayerRef.current = L.layerGroup().addTo(map);
    corridorsLayerRef.current = L.layerGroup().addTo(map);

    // Draw documented Elephant Corridors in Gudalur Division
    // Corridor 1: O-Valley through Gudalur to Mudumalai
    const oValleyCorridor = L.polyline(
      [
        [11.4650, 76.4520],
        [11.4872, 76.5410],
        [11.5034, 76.4913],
        [11.5378, 76.5390],
      ],
      {
        color: '#f59e0b',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.7,
      }
    ).bindTooltip('Known Elephant Migration Corridor (O-Valley ⇄ Mudumalai Buffer)', {
      sticky: true,
      className: 'bg-slate-900 text-amber-300 text-xs px-2 py-1 rounded border border-amber-500/30',
    });

    // Corridor 2: Cherambadi to Devala
    const cherambadiCorridor = L.polyline(
      [
        [11.5301, 76.2845],
        [11.4889, 76.3312],
        [11.4815, 76.3820],
      ],
      {
        color: '#f97316',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.7,
      }
    ).bindTooltip('High Conflict Wildlife Passage (Cherambadi ⇄ Pandalur ⇄ Devala)', {
      sticky: true,
      className: 'bg-slate-900 text-orange-300 text-xs px-2 py-1 rounded border border-orange-500/30',
    });

    corridorsLayerRef.current.addLayer(oValleyCorridor);
    corridorsLayerRef.current.addLayer(cherambadiCorridor);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Camera Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    cameras.forEach((cam) => {
      const isSelected = cam.id === activeCameraId;
      const isPersonal = cam.isPersonalCamera;

      // Check if this camera has an active critical alert
      const hasAlert = recentAlerts.some(
        (a) => a.cameraId === cam.id && a.status !== 'ON_SITE_VERIFIED'
      );

      // Distinct styling for Personal Camera vs CCTV nodes
      const markerColor = hasAlert
        ? '#ef4444' // Red alert
        : isPersonal
        ? '#06b6d4' // Cyan personal
        : '#10b981'; // Green normal

      const pulseRing = hasAlert
        ? `<div className="absolute -inset-2 rounded-full animate-ping bg-red-500/40"></div>`
        : isSelected
        ? `<div className="absolute -inset-1.5 rounded-full ring-2 ring-emerald-400 animate-pulse"></div>`
        : '';

      const html = `
        <div className="relative flex items-center justify-center cursor-pointer group">
          ${pulseRing}
          <div style="background-color: ${markerColor};" className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg text-slate-950 font-bold text-xs">
            ${isPersonal ? '★' : 'CAM'}
          </div>
          <div className="absolute -bottom-5 whitespace-nowrap bg-slate-950/90 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">
            ${cam.isPersonalCamera ? 'MY CAMERA' : cam.name.split(' ')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'custom-surveillance-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(cam.coordinates, { icon: customIcon });

      // Coverage visual circle
      const coverageCircle = L.circle(cam.coordinates, {
        radius: isPersonal ? 450 : 600,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: isSelected ? 0.2 : 0.08,
        weight: isSelected ? 2 : 1,
        dashArray: isSelected ? '4, 4' : undefined,
      });

      marker.on('click', () => {
        onSelectCamera(cam.id);
      });

      const popupContent = `
        <div className="p-1 space-y-1.5 text-xs">
          <div className="font-bold text-slate-100 flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
            <span>${cam.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono ${isPersonal ? 'bg-cyan-950 text-cyan-400 border border-cyan-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-700'}">${cam.status}</span>
          </div>
          <div className="text-slate-300"><b>Sector:</b> ${cam.sector}</div>
          <div className="text-slate-400 font-mono text-[11px]"><b>GPS:</b> ${cam.coordinates[0].toFixed(4)}° N, ${cam.coordinates[1].toFixed(4)}° E</div>
          <div className="text-slate-300"><b>Low Light Sensor:</b> <span className="text-emerald-400">${cam.lowLightMode}</span> (0.0${Math.floor(cam.currentLux * 100)} Lux)</div>
          <div className="text-slate-400"><b>24/7 Power:</b> ${cam.batteryPercent}% (${cam.solarStatus})</div>
          ${hasAlert ? '<div className="mt-1 text-red-400 font-bold bg-red-950/60 p-1 rounded border border-red-800">⚠️ ACTIVE WILD ANIMAL ALERT DISPATCHED</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      layer.addLayer(coverageCircle);
      layer.addLayer(marker);
    });
  }, [cameras, activeCameraId, recentAlerts, onSelectCamera]);

  // Update Historical Casualty Hotspots Layer
  useEffect(() => {
    const layer = casualtiesLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    if (!showCasualtyHotspots) return;

    historicalCasualties.forEach((record) => {
      const html = `
        <div className="relative flex items-center justify-center cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-rose-950 border-2 border-rose-500 flex items-center justify-center text-rose-300 text-[11px] font-bold shadow-md hover:scale-125 transition-transform">
            ✝
          </div>
        </div>
      `;

      const casualtyIcon = L.divIcon({
        html,
        className: 'custom-casualty-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(record.coordinates, { icon: casualtyIcon });

      const popup = `
        <div className="p-1 space-y-1 text-xs">
          <div className="font-bold text-rose-400 border-b border-rose-900/60 pb-1 flex items-center justify-between">
            <span>Historical Fatality Record</span>
            <span className="text-slate-400">${record.date}</span>
          </div>
          <div className="text-slate-200"><b>Sector:</b> ${record.sector}</div>
          <div className="text-amber-400 font-medium"><b>Victim:</b> ${record.victimProfile}</div>
          <div className="text-red-300"><b>Animal:</b> ${record.animalInvolved}</div>
          <div className="text-slate-400"><b>Time:</b> ${record.timeOfDay}</div>
          <div className="text-slate-300 text-[11px] mt-1 italic">${record.circumstance}</div>
          <div className="mt-1 text-emerald-300 text-[11px] bg-emerald-950/50 p-1 rounded border border-emerald-800">
            <b>Mitigation:</b> ${record.mitigationImpact}
          </div>
        </div>
      `;

      marker.bindPopup(popup);
      layer.addLayer(marker);
    });
  }, [showCasualtyHotspots, historicalCasualties]);

  const handleCenterOnPersonalCam = () => {
    const myCam = cameras.find((c) => c.isPersonalCamera);
    if (myCam && mapInstanceRef.current) {
      mapInstanceRef.current.setView(myCam.coordinates, 14, { animate: true });
      onSelectCamera(myCam.id);
    }
  };

  const handleCenterOnGudalur = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(GUDALUR_CENTER, 12, { animate: true });
    }
  };

  return (
    <div id="gudalur-surveillance-map-container" className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-xl">
      {/* Map Control Header */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Nilgiris Gudalur Tactical Grid</span>
        </div>

        <button
          id="btn-center-my-cam"
          onClick={handleCenterOnPersonalCam}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Focus My Camera
        </button>

        <button
          id="btn-center-gudalur-overview"
          onClick={handleCenterOnGudalur}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          Gudalur Division View
        </button>

        <button
          id="btn-toggle-casualty-pins"
          onClick={onToggleCasualties}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
            showCasualtyHotspots
              ? 'bg-rose-950 text-rose-300 border-rose-800 ring-1 ring-rose-500'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          {showCasualtyHotspots ? 'Hide Fatality Hotspots' : 'Show Fatality Hotspots'}
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2.5 rounded-lg border border-slate-800 shadow-xl text-[11px] space-y-1.5">
        <div className="font-semibold text-slate-300 flex items-center justify-between gap-3 text-xs border-b border-slate-800 pb-1">
          <span>Surveillance Legend</span>
          <span className="text-emerald-400 font-mono">24/7 Active</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block border border-slate-900"></span>
          <span>My Personal Camera (Field Post)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-slate-900"></span>
          <span>Network CCTV (O-Valley / Devala / Pandalur)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse border border-slate-900"></span>
          <span>Active Animal Incursion Alert</span>
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <span className="w-4 h-0.5 bg-amber-400 inline-block border-t border-dashed"></span>
          <span>Elephant Migration Corridor</span>
        </div>
        {showCasualtyHotspots && (
          <div className="flex items-center gap-2 text-rose-300">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-center text-[9px] font-bold">✝</span>
            <span>Historical Human Fatality Record</span>
          </div>
        )}
      </div>

      {/* Actual Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />
    </div>
  );
};
