import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CameraNode, ConflictIncidentRecord, ForestDeptAlert, WildlifeSightingTrack } from '../types/surveillance';
import { GUDALUR_CENTER, SETTLEMENTS_DATA, ROADS_DATA, INITIAL_MOVEMENT_TRACKS } from '../data/gudalurData';
import {
  MapPin,
  Navigation,
  ShieldAlert,
  Eye,
  Radio,
  Filter,
  Layers,
  Compass,
  Home,
  Route,
  Activity,
} from 'lucide-react';

interface GudalurMapProps {
  cameras: CameraNode[];
  activeCameraId: string;
  onSelectCamera: (camId: string) => void;
  recentAlerts: ForestDeptAlert[];
  historicalCasualties: ConflictIncidentRecord[];
  showCasualtyHotspots: boolean;
  onToggleCasualties: () => void;
  movementTracks?: WildlifeSightingTrack[];
  onViewEvidence?: (item: any) => void;
}

export const GudalurMap: React.FC<GudalurMapProps> = ({
  cameras,
  activeCameraId,
  onSelectCamera,
  recentAlerts,
  historicalCasualties,
  showCasualtyHotspots,
  onToggleCasualties,
  movementTracks = INITIAL_MOVEMENT_TRACKS,
  onViewEvidence,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layers
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const casualtiesLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const settlementsLayerRef = useRef<L.LayerGroup | null>(null);
  const roadsLayerRef = useRef<L.LayerGroup | null>(null);
  const movementTracksLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter state (Upgrade 5)
  const [filterSpecies, setFilterSpecies] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [showSettlements, setShowSettlements] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showMovementTrail, setShowMovementTrail] = useState<boolean>(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: GUDALUR_CENTER,
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark high-contrast carto tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    casualtiesLayerRef.current = L.layerGroup().addTo(map);
    corridorsLayerRef.current = L.layerGroup().addTo(map);
    settlementsLayerRef.current = L.layerGroup().addTo(map);
    roadsLayerRef.current = L.layerGroup().addTo(map);
    movementTracksLayerRef.current = L.layerGroup().addTo(map);

    // Corridor 1: O-Valley through Gudalur to Mudumalai
    const oValleyCorridor = L.polyline(
      [
        [11.465, 76.452],
        [11.4872, 76.541],
        [11.5034, 76.4913],
        [11.5378, 76.539],
      ],
      {
        color: '#f59e0b',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.8,
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
        [11.4815, 76.382],
      ],
      {
        color: '#f97316',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.8,
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

  // Update Settlements & Roads Layers (Upgrade 5)
  useEffect(() => {
    const sLayer = settlementsLayerRef.current;
    const rLayer = roadsLayerRef.current;
    if (!sLayer || !rLayer) return;

    sLayer.clearLayers();
    rLayer.clearLayers();

    if (showSettlements) {
      SETTLEMENTS_DATA.forEach((st) => {
        const isConflict = st.riskZone === 'HIGH_CONFLICT';
        const html = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div style="background-color: ${isConflict ? '#881337' : '#1e293b'}; border: 1.5px solid ${isConflict ? '#f43f5e' : '#64748b'};"
                 class="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] shadow-lg">
              ⌂
            </div>
            <div class="absolute -bottom-4 whitespace-nowrap bg-slate-950/90 text-[9px] font-mono text-slate-300 px-1 rounded border border-slate-700">
              ${st.name.split(' ')[0]}
            </div>
          </div>
        `;
        const icon = L.divIcon({ html, className: 'settlement-marker', iconSize: [24, 24], iconAnchor: [12, 12] });
        const marker = L.marker(st.coordinates, { icon });
        marker.bindPopup(`
          <div class="p-1 space-y-1 text-xs">
            <div class="font-bold text-white border-b border-slate-700 pb-1">${st.name}</div>
            <div class="text-slate-300">Type: <b>${st.type.replace('_', ' ')}</b></div>
            <div class="text-slate-400">Est. Pop: ${st.populationEstimate.toLocaleString()} residents</div>
            <div class="text-[11px] ${isConflict ? 'text-rose-400 font-bold' : 'text-slate-400'}">Risk Zone: ${st.riskZone}</div>
          </div>
        `);
        sLayer.addLayer(marker);
      });
    }

    if (showRoads) {
      ROADS_DATA.forEach((road) => {
        const poly = L.polyline(road.coordinates, {
          color: road.type === 'NATIONAL_HIGHWAY' ? '#38bdf8' : '#94a3b8',
          weight: road.type === 'NATIONAL_HIGHWAY' ? 3.5 : 2,
          opacity: 0.6,
        }).bindTooltip(road.name, {
          sticky: true,
          className: 'bg-slate-900 text-sky-300 text-xs px-2 py-1 rounded border border-sky-800',
        });
        rLayer.addLayer(poly);
      });
    }
  }, [showSettlements, showRoads]);

  // Update Movement Sequence Tracks (Upgrade 6)
  useEffect(() => {
    const layer = movementTracksLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!showMovementTrail || movementTracks.length === 0) return;

    // Filter tracks
    const activeTracks = movementTracks.filter((t) => {
      if (filterSpecies !== 'ALL' && !t.species.toLowerCase().includes(filterSpecies.toLowerCase())) return false;
      if (filterRisk !== 'ALL' && t.risk !== filterRisk) return false;
      return true;
    });

    if (activeTracks.length < 2) return;

    // Draw sequential connecting vector lines
    const coords = activeTracks.map((t) => t.coordinates);
    const vectorLine = L.polyline(coords, {
      color: '#06b6d4',
      weight: 3,
      dashArray: '8, 6',
      opacity: 0.85,
    }).bindTooltip('Multi-Camera Temporal Ingress Vector Sequence [DEMO DATA]', {
      sticky: true,
      className: 'bg-slate-900 text-cyan-300 text-xs px-2 py-1 rounded border border-cyan-800',
    });
    layer.addLayer(vectorLine);

    // Place numbered sequence markers
    activeTracks.forEach((t) => {
      const html = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-full bg-cyan-950 border-2 border-cyan-400 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center shadow-lg">
            ${t.sequenceOrder}
          </div>
        </div>
      `;
      const icon = L.divIcon({ html, className: 'track-step-pin', iconSize: [24, 24], iconAnchor: [12, 12] });
      const marker = L.marker(t.coordinates, { icon });
      marker.bindPopup(`
        <div class="p-1 space-y-1 text-xs">
          <div class="font-bold text-cyan-300 border-b border-cyan-900 pb-1">Sighting Step #${t.sequenceOrder}</div>
          <div class="text-white font-semibold">${t.species}</div>
          <div class="text-slate-400 font-mono">${t.timestamp} • ${t.cameraName}</div>
          <div class="text-slate-300 text-[11px]">${t.direction || 'In Transit'}</div>
        </div>
      `);
      layer.addLayer(marker);
    });
  }, [showMovementTrail, movementTracks, filterSpecies, filterRisk]);

  // Update Camera & Active Detection Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    cameras.forEach((cam) => {
      const isSelected = cam.id === activeCameraId;
      const isPersonal = cam.isPersonalCamera;

      // Filter check
      const camAlerts = recentAlerts.filter((a) => a.cameraId === cam.id);
      const activeAlert = camAlerts.find(
        (a) => a.status !== 'ON_SITE_VERIFIED' && a.status !== 'RESOLVED' && a.status !== 'FALSE_POSITIVE'
      );

      if (filterRisk !== 'ALL' && activeAlert && activeAlert.threatLevel !== filterRisk) {
        // Skip if risk doesn't match
      }

      const hasAlert = !!activeAlert;
      const markerColor = hasAlert ? '#ef4444' : isPersonal ? '#06b6d4' : '#10b981';

      const pulseRing = hasAlert
        ? `<div class="absolute -inset-2 rounded-full animate-ping bg-red-500/40"></div>`
        : isSelected
        ? `<div class="absolute -inset-1.5 rounded-full ring-2 ring-emerald-400 animate-pulse"></div>`
        : '';

      const iconLabel = hasAlert ? '⚠️' : isPersonal ? '★' : 'CAM';

      const html = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${pulseRing}
          <div style="background-color: ${markerColor};" class="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg text-slate-950 font-bold text-xs">
            ${iconLabel}
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap bg-slate-950/90 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">
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
        <div class="p-1 space-y-1.5 text-xs">
          <div class="font-bold text-slate-100 flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
            <span>${cam.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono ${
              isPersonal
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-700'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
            }">${cam.status}</span>
          </div>
          <div class="text-slate-300"><b>Sector:</b> ${cam.sector}</div>
          <div class="text-slate-400 font-mono text-[11px]"><b>GPS:</b> ${cam.coordinates[0].toFixed(4)}° N, ${cam.coordinates[1].toFixed(4)}° E</div>
          <div class="text-slate-300"><b>Low Light Sensor:</b> <span class="text-emerald-400">${cam.lowLightMode}</span> (${cam.currentLux} Lux)</div>
          <div class="text-slate-400"><b>Power:</b> ${cam.batteryPercent}% (${cam.solarStatus})</div>
          ${
            hasAlert
              ? `<div class="mt-1 text-red-300 font-bold bg-red-950/80 p-1.5 rounded border border-red-700">
                  ⚠️ ACTIVE ALERT: ${activeAlert.species} (${activeAlert.threatLevel})
                  <div class="text-[10px] text-slate-300 font-normal mt-0.5">${activeAlert.suggestedAction}</div>
                </div>`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent);
      layer.addLayer(coverageCircle);
      layer.addLayer(marker);
    });
  }, [cameras, activeCameraId, recentAlerts, onSelectCamera, filterRisk]);

  // Update Casualty Hotspots Layer
  useEffect(() => {
    const layer = casualtiesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!showCasualtyHotspots) return;

    historicalCasualties.forEach((record) => {
      const html = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-full bg-rose-950 border-2 border-rose-500 flex items-center justify-center text-rose-300 text-[11px] font-bold shadow-md hover:scale-125 transition-transform">
            ✝
          </div>
        </div>
      `;
      const casualtyIcon = L.divIcon({ html, className: 'custom-casualty-pin', iconSize: [24, 24], iconAnchor: [12, 12] });
      const marker = L.marker(record.coordinates, { icon: casualtyIcon });

      const popup = `
        <div class="p-1 space-y-1 text-xs">
          <div class="font-bold text-rose-400 border-b border-rose-900/60 pb-1 flex items-center justify-between">
            <span>Historical Fatality Record</span>
            <span class="text-slate-400">${record.date}</span>
          </div>
          <div class="text-slate-200"><b>Sector:</b> ${record.sector}</div>
          <div class="text-amber-400 font-medium"><b>Victim:</b> ${record.victimProfile}</div>
          <div class="text-red-300"><b>Animal:</b> ${record.animalInvolved}</div>
          <div class="text-slate-400"><b>Time:</b> ${record.timeOfDay}</div>
          <div class="text-slate-300 text-[11px] mt-1 italic">${record.circumstance}</div>
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
    <div id="gudalur-surveillance-map-container" className="relative w-full h-full min-h-[440px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-xl">
      {/* Top Map Action Ribbon */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Nilgiris Tactical Grid</span>
        </div>

        <button
          onClick={handleCenterOnPersonalCam}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Focus My Camera
        </button>

        <button
          onClick={handleCenterOnGudalur}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          Division View
        </button>

        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
            showFilterDrawer ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters & Layers</span>
        </button>
      </div>

      {/* Filter & Layer Drawer (Upgrade 5) */}
      {showFilterDrawer && (
        <div className="absolute top-14 left-3 z-[400] bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-3 max-w-xs animate-fade-in">
          <div className="font-bold text-white border-b border-slate-700 pb-1.5 flex items-center justify-between">
            <span>Map Layers & Filters</span>
            <span className="text-[10px] text-slate-400 font-mono">GIS CONTROLS</span>
          </div>

          {/* Toggle Layers */}
          <div className="space-y-1.5">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Toggle Overlays:</span>
            <div className="flex flex-col gap-1.5 text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCasualtyHotspots}
                  onChange={onToggleCasualties}
                  className="rounded text-rose-500 focus:ring-0"
                />
                <span>Fatality Hotspots (Historical)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSettlements}
                  onChange={() => setShowSettlements(!showSettlements)}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span>Villages & Worker Quarters</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoads}
                  onChange={() => setShowRoads(!showRoads)}
                  className="rounded text-sky-500 focus:ring-0"
                />
                <span>Highway & Arterial Roads</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMovementTrail}
                  onChange={() => setShowMovementTrail(!showMovementTrail)}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span>Ingress Movement Vectors</span>
              </label>
            </div>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-1">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Risk Level:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Alerts Only</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
            </select>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-800 shadow-xl text-[11px] space-y-1.5 max-w-[240px]">
        <div className="font-semibold text-slate-300 flex items-center justify-between gap-3 text-xs border-b border-slate-800 pb-1">
          <span>Tactical Map Legend</span>
          <span className="text-emerald-400 font-mono">24/7 Grid</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block border border-slate-900"></span>
          <span>My Personal Camera Post</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-slate-900"></span>
          <span>Network CCTV Camera Node</span>
        </div>
        <div className="flex items-center gap-2 text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse border border-slate-900"></span>
          <span>Active Wildlife Incursion</span>
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <span className="w-3.5 h-0.5 bg-amber-400 inline-block border-t border-dashed"></span>
          <span>Elephant Migration Corridor</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-300">
          <span className="w-3.5 h-0.5 bg-cyan-400 inline-block border-t border-dashed"></span>
          <span>Ingress Sequence Trail (Demo)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-[10px]">⌂</span>
          <span>Village / Worker Quarters</span>
        </div>
      </div>

      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />
    </div>
  );
};
