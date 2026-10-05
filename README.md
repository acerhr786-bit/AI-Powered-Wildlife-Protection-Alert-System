# AI-Powered Wildlife Surveillance, Early Warning & Conflict Mitigation System

**Location:** Gudalur Forest Division, Nilgiris Biosphere Reserve, Tamil Nadu, India  
**Coordinates Center:** 11.5034° N, 76.4913° E  
**Project Classification:** Final-Year Engineering College Research & Tactical Wildlife Control Room System  

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Features](#-features)
4. [Technology Stack](#-technology-stack)
5. [Project Structure](#-project-structure)
6. [Installation & Setup](#-installation--setup)
7. [Environment Variables](#-environment-variables)
8. [Running the Application](#-running-the-application)
9. [DEMO Mode vs Live Mode](#-demo-mode-vs-live-mode)
10. [Unit Testing Strategy & Guide](#-unit-testing-strategy--guide)
11. [Error Handling & Error Boundaries](#-error-handling--error-boundaries)
12. [Complete API Reference](#-complete-api-reference)
13. [Database & Data Schema Documentation](#-database--data-schema-documentation)
14. [Security & Threat Model](#-security--threat-model)
15. [Troubleshooting](#-troubleshooting)
16. [Development Guidelines](#-development-guidelines)
17. [Future Improvements & Roadmap](#-future-improvements--roadmap)

---

## 🌿 Project Overview

The **Nilgiris Wildlife Early Warning & Conflict Mitigation System** is an AI-powered surveillance and early-warning operations platform designed for high-conflict forested corridors in the Western Ghats (specifically the Gudalur Forest Division of Tamil Nadu, bordering Mudumalai Tiger Reserve, Wayanad Wildlife Sanctuary, and Bandipur National Park).

### Problem Statement
In the Gudalur landscape, human settlements and tea plantations intersect directly with ancient Asian elephant (*Elephas maximus*) migration paths. Over **78.4% of fatal human encounters occur during low-light hours** (04:30–06:30 pre-dawn mist and 18:30–23:00 post-dusk), when human laborers cannot visually detect approaching wildlife.

### Core Solution
This application continuously monitors networked CCTV nodes and personal field cameras using edge-assisted computer vision and infrared/Starvis low-light sensor tuning. When a dangerous wild animal is detected, it calculates a multi-factor risk score, displays bounding boxes, sounds an emergency acoustic siren, models movement trajectories, and auto-dispatches an actionable ticket to the Tamil Nadu Forest Department Rapid Response Team (RRT).

---

## 🏛️ Architecture

The system follows a strict modular pipeline separating sensing, perception, evaluation, dispatch, and visualization:

```
┌─────────────────────────────────────────────────────────────┐
│                     1. VIDEO INGESTION                      │
│   Webcam (WebRTC) │ Video Upload │ IP CCTV │ RTSP Streams   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Frame Buffers)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 2. MODULAR AI DETECTION                     │
│    Gemini Vision API │ Edge YOLO / ONNX │ Local Heuristic   │
│   (Elephant, Leopard, Tiger, Boar, Deer, Gaur, Bear, Human) │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Detection Events + Bounding Boxes)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   3. AI WILDLIFE RISK ENGINE                │
│   Evaluates: Species Hazard + Human Proximity Multiplier +  │
│   Settlement Distance + Road Distance + Lux/Night Factor    │
│            Result: LOW | MEDIUM | HIGH | CRITICAL           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     4. SMART ALERT SYSTEM    │ │   5. TACTICAL GIS & TRACKS   │
│  State Machine:              │ │  Interactive Leaflet Map:    │
│  NEW -> ACK -> INV -> RES    │ │  Corridors, Habitations,     │
│  SMS/WhatsApp Dispatch Hub   │ │  Sequential Movement Vectors │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │
               └──────────────┬─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                6. CONTROL ROOM & ANALYTICS UI               │
│   Control Dashboard │ Live Feeds │ Incidents │ Telemetry    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **Multi-Species Recognition:** Asian Elephant, Indian Leopard, Bengal Tiger, Indian Wild Boar, Spotted Deer, Sloth Bear, Indian Gaur (Bison), Human, and Vehicles.
- **Normalized Bounding Boxes:** 0–100% resolution-independent bounding box overlays displaying species, confidence %, and risk badge.
- **Automated Human Safety Suppression:** When humans (tea pluckers, estate guards, pedestrians) are spotted without predator danger, the system logs them as **SAFE** and suppresses Forest Department sirens to prevent alarm fatigue.
- **Multi-Factor Risk Assessment:** Quantitative threat score (0–100) and rationale answering *"Why is this alert high risk?"*.
- **Tactical GIS Map:** Real GPS coordinates of cameras, migration corridors, villages, worker settlements, and highway routes using dark Carto tiles.
- **Wildlife Movement History:** Sequential tracking across multi-camera hops showing vectors and directional headings without biometric re-ID over-claiming.
- **Field Incident Management:** Incident logging, officer assignment, resolution notes, and status management (`OPEN`, `UNDER INVESTIGATION`, `MITIGATED`, `CLOSED`).
- **Low-Light Enhancements:** Brightness (100%–250%), Contrast (100%–220%), Starvis boost, and Grayscale 850nm IR mode.
- **Role-Based Access Control (RBAC):** Admin, Forest Officer, Control Room Operator, Researcher, and Viewer.
- **System Health Monitor:** Real-time ping, uptime, battery, and solar status across all camera nodes and AI services.
- **Academic Research Archive:** Historical human casualty case studies and exports in CSV, JSON, and Markdown Thesis Report.

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Component architecture & type-safe state |
| **Build Tool & Bundler** | Vite 6 | Fast HMR, optimized production build |
| **Styling** | Tailwind CSS v4 | Tactical dark-mode command center UI |
| **Mapping & GIS** | Leaflet 1.9 + Carto Dark | Tactical map rendering, corridor vectors |
| **Icons** | Lucide React | High-contrast tactical iconography |
| **Audio Alerting** | Web Audio API (AudioContext) | Synthesized multi-tone emergency siren |
| **Testing** | Vitest 5 | Fast, native unit-testing framework |
| **AI / Vision API** | `@google/genai` (Gemini 2.5/Flash) | Cloud multimodal frame analysis |
| **Server / Middleware**| Node.js + Vite Dev Middleware | Proxy API routes & frame processing |

---

## 📁 Project Structure

```
├── .env.example                     # Example environment variables
├── README.md                        # Complete project documentation
├── index.html                       # HTML entry point with Leaflet styles
├── metadata.json                    # AI Studio applet capabilities and permissions
├── package.json                     # Dependencies, scripts, and Vitest runner
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite config, dev middleware & API endpoints
├── vitest.config.ts                 # Vitest unit-testing configuration
└── src/
    ├── App.tsx                      # Root application controller & tab navigation
    ├── main.tsx                     # React 19 entry point
    ├── index.css                    # Tailwind CSS global styles
    ├── __tests__/                   # Comprehensive Unit Test Suite
    │   ├── alertService.test.ts     # Smart alert lifecycle & integrations tests
    │   ├── detectionService.test.ts # CV inference & false-alarm suppression tests
    │   └── riskEngine.test.ts       # Risk calculation & boundary conditions tests
    ├── components/                  # UI Components
    │   ├── AnalyticsDashboard.tsx   # Statistical telemetry & distribution charts
    │   ├── AnimalMovementTracker.tsx# Sequential movement trails & vector lines
    │   ├── CameraInventory.tsx      # Edge camera hardware registry & telemetry
    │   ├── ConflictIncidentArchive.tsx # Historical human casualties study & export
    │   ├── ControlRoomDashboard.tsx # Unified command center overview
    │   ├── ErrorBoundary.tsx        # React Error Boundary for isolated error handling
    │   ├── EvidenceViewerModal.tsx  # Snapshot inspector with bounding boxes
    │   ├── ForestDepartmentAlerts.tsx # Smart alert queue & AI explanation drawer
    │   ├── GudalurMap.tsx           # Leaflet tactical map with corridors & settlements
    │   ├── HeaderBar.tsx            # Navigation tabs, RBAC role switcher, demo toggle
    │   ├── IncidentManagement.tsx   # Incident tickets, assignment, and resolution
    │   ├── LiveCameraFeed.tsx       # Multi-source video feed & low-light calibration
    │   └── PersonalDashboardFeed.tsx# Live detection log stream
    ├── data/
    │   └── gudalurData.ts           # GIS coordinates, cameras, corridors, demo datasets
    ├── services/                    # Business Logic & Core Engines
    │   ├── alertService.ts          # Centralized alert state machine & notifications
    │   ├── detectionService.ts      # Modular CV detection & fallback simulator
    │   └── riskEngine.ts            # Multi-factor AI risk assessment engine
    ├── types/
    │   └── surveillance.ts          # TypeScript type definitions and interfaces
    └── utils/
        ├── audioAlert.ts            # Web Audio API emergency acoustic siren
        └── exportUtils.ts           # CSV, JSON, and Markdown report export tools
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn** / **pnpm** / **bun**

### Installation Steps

1. Clone or extract the project directory on your computer:
   ```bash
   cd nilgiris-wildlife-alert-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env
   ```

---

## 🔑 Environment Variables

The project runs completely out of the box in **DEMO SIMULATION MODE** without requiring external credentials. If you wish to enable live Gemini Multimodal Vision analysis on real webcam frames, add your API key to `.env`:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for real camera frame analysis. |
| `PORT` | Optional | `3000` | Port for the development server. |

---

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
*(Or `npm start`)*

Open your browser at:
```
http://localhost:3000
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🧪 DEMO Mode vs Live Mode

The system features an explicit mode toggle in the top telemetry ribbon:

- **DEMO DATA ACTIVE (`isDemoMode: true`):**
  - All camera feeds, detections, GPS corridors, and dispatch tickets use realistic, calibrated Nilgiris data.
  - Every simulated item displays a prominent `[DEMO DATA]` or `[DEMO CAMERA]` badge.
  - Allows zero-hardware testing of elephant incursions, leopard fence crossings, and human safety suppression.
- **LIVE TELEMETRY (`isDemoMode: false`):**
  - Connects to real WebRTC local cameras, user video files, and active network nodes.
  - Uses live frame extraction and calls the server-side vision proxy.

---

## 🔬 Unit Testing Strategy & Guide

### Testing Philosophy
Automated early warning systems operate in life-critical environments. If a solitary tusker approaches within 35 meters of worker quarters at night, a calculation error cannot cause the risk level to downgrade to `LOW`. Similarly, human workers must never trigger false emergency dispatches.

Our unit tests verify:
1. **Deterministic Business Logic:** Mathematical risk scoring, human presence overrides, proximity thresholds.
2. **Boundary Conditions & Invalid Inputs:** Empty species strings, out-of-range coordinates, zero lux levels.
3. **Decoupled Fallback:** Verification that network failures in CV APIs gracefully fall back to local heuristics rather than crashing.
4. **State Machine Transitions:** Alert status lifecycle (`NEW` ➔ `ACKNOWLEDGED` ➔ `INVESTIGATING` ➔ `RESOLVED`).

### Test Commands

Run all tests once:
```bash
npm test
```
*(Runs `vitest run`)*

Run tests in interactive watch mode:
```bash
npm run test:watch
```

Check TypeScript types without emitting:
```bash
npm run lint
```

### Test Suite Structure

| Test File | Modules Under Test | Key Scenarios Tested |
| :--- | :--- | :--- |
| `src/__tests__/riskEngine.test.ts` | `calculateWildlifeRisk` | Solitary tusker at night (CRITICAL), human worker movement (SAFE/suppressed), empty input fallbacks, herd size multipliers, road proximity collision risk. |
| `src/__tests__/detectionService.test.ts` | `detectionService` | Elephant simulation, human detection with `forestDeptAlertRequired = false`, vehicle transit, API network failure fallback. |
| `src/__tests__/alertService.test.ts` | `alertService` | Ticket formatting (`TN-FD-GDL-2026-XXXX`), status lifecycle transitions, resolution notes, notification channel configurations. |

### How to Add New Tests

1. Create a file under `src/__tests__/<moduleName>.test.ts`.
2. Import `describe`, `it`, `expect` from `vitest`.
3. Follow the Arrange-Act-Assert pattern:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { calculateWildlifeRisk } from '../services/riskEngine';

   describe('Custom Species Risk Check', () => {
     it('scores Sloth Bear in organic waste pit as HIGH', () => {
       const result = calculateWildlifeRisk({
         species: 'Sloth Bear',
         animalCount: 1,
         humanNearby: false,
         distanceFromSettlementMeters: 45,
         isNightTime: true,
         luxLevel: 0.02,
       });

       expect(result.level).toBe('HIGH');
       expect(result.factors.speciesRisk).toContain('Sloth Bear');
     });
   });
   ```

---

## 🛡️ Error Handling & Error Boundaries

### React Error Boundary Architecture (`src/components/ErrorBoundary.tsx`)

A single unhandled rendering error in a complex component (e.g. Leaflet map container resizing, WebRTC permission rejection, or corrupt video decoding) must **never** take down the entire surveillance command center.

#### Protected Components:
Each primary view in `App.tsx` is wrapped in an independent `ErrorBoundary`:
- **Control Room Dashboard** (`ControlRoomDashboard`)
- **Live Camera Feed** (`LiveCameraFeed`)
- **GIS Tactical Map** (`GudalurMap`)
- **Forest Department Dispatch** (`ForestDepartmentAlerts`)
- **Incident Management** (`IncidentManagement`)
- **Animal Activity Tracker** (`AnimalMovementTracker`)
- **Analytics Dashboard** (`AnalyticsDashboard`)
- **Research Archive** (`ConflictIncidentArchive`)
- **Camera Telemetry Network** (`CameraInventory`)
- **System Health Monitor** (`SystemHealthView`)
- **Event Feed Stream** (`PersonalDashboardFeed`)

#### Error Boundary Behavior:
1. **Isolation:** If the GIS map fails to render a tile, the user sees an isolated "Map Widget Unavailable" banner with a **"Retry Module"** button, while camera feeds and emergency siren alerts continue running unimpeded.
2. **Safe User Messages:** Stack traces, internal variables, and sensitive tokens are strictly stripped from the UI and logged safely to the console.
3. **Recovery:** Users can click **"Retry Module"** to reset component state or **"Reload Application"** for a clean browser refresh.

---

## 📡 Complete API Reference

All backend API endpoints are handled via Vite server middleware defined in `vite.config.ts`.

### 1. Analyze Camera Frame
Analyzes a live video frame (or base64 snapshot) using the multimodal AI model or preset scenarios.

- **URL:** `/api/analyze-frame`
- **Method:** `POST`
- **Authentication:** None (Internal / Local dev server proxy)
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "isLowLightMode": true,
  "cameraName": "CCTV-01 [O-Valley Sector 4 Corridor]",
  "sector": "O-Valley Elephant Range",
  "scenarioId": "demo-elephant-night"
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `imageBase64` | `string` | Optional* | Base64 JPEG data URL of the captured frame. (*Required if no `scenarioId`). |
| `isLowLightMode` | `boolean` | Optional | Whether night-vision IR or Starvis low-light sensor is active. |
| `cameraName` | `string` | Optional | Friendly identifier of camera node. |
| `sector` | `string` | Optional | Forest beat or plantation sector name. |
| `scenarioId` | `string` | Optional | Preset ID for testing (`demo-elephant-night`, `demo-human-worker`, `demo-leopard-thermal`, etc.). |

#### Successful Response (`200 OK`):
```json
{
  "detected": "wild_animal",
  "species": "Asian Elephant (Elephas maximus - Solitary Tusker)",
  "confidence": 97,
  "count": 1,
  "is_low_light": true,
  "threat_level": "CRITICAL",
  "forest_dept_alert_required": true,
  "details": "Large wild tusker moving 15m from plantation boundary in 0.01 lux infrared mode. High risk of human encounter.",
  "suggested_action": "Auto-dispatch Tamil Nadu Forest Department Rapid Response Team (RRT). Activate perimeter strobe siren.",
  "timestamp": "10:14:08 PM"
}
```

#### Human Detected Response (`200 OK` - Safe / Suppressed):
```json
{
  "detected": "human",
  "species": "Human (Tea Plucker / Estate Worker)",
  "confidence": 96,
  "count": 1,
  "is_low_light": true,
  "threat_level": "SAFE",
  "forest_dept_alert_required": false,
  "details": "Human detected in camera zone with handheld utility light. Normal authorized movement. No forest alert generated.",
  "suggested_action": "Alert suppressed per protocol. Camera continues 24/7 observation.",
  "timestamp": "10:15:30 PM"
}
```

#### Error Responses:
- `500 Internal Server Error`: `{"error": "Internal surveillance server error"}`

---

### 2. Forest Department RRT Dispatch
Generates an emergency ticket and triggers automated mobilization logs.

- **URL:** `/api/forest-dept-dispatch`
- **Method:** `POST`
- **Authentication:** None
- **Headers:** `Content-Type: application/json`

#### Request Body:
```json
{
  "cameraId": "cam-gdl-01",
  "cameraName": "CCTV-01 [O-Valley Sector 4 Corridor]",
  "species": "Asian Elephant (Solitary Tusker)",
  "threatLevel": "CRITICAL",
  "exactCoordinates": "11.4872° N, 76.5410° E",
  "location": "O-Valley Tea Estate, Sector 4",
  "suggestedAction": "Mobilize RRT patrol with acoustic sirens."
}
```

#### Successful Response (`200 OK`):
```json
{
  "success": true,
  "alert": {
    "ticketId": "TN-FD-GDL-2026-8812",
    "division": "Nilgiris South & Gudalur Forest Division",
    "rangeOffice": "Gudalur Range Office / O-Valley Beat",
    "rrtUnit": "Rapid Response Team Alpha (RRT-01)",
    "eventId": "evt-1741234567890",
    "cameraId": "cam-gdl-01",
    "cameraName": "CCTV-01 [O-Valley Sector 4 Corridor]",
    "species": "Asian Elephant (Solitary Tusker)",
    "threatLevel": "CRITICAL",
    "exactCoordinates": "11.4872° N, 76.5410° E",
    "location": "O-Valley Tea Estate, Sector 4",
    "timestamp": "10:14:08 PM",
    "urgency": "IMMEDIATE",
    "assignedRFO": "RFO Gudalur Division & RRT Duty Officer",
    "contactHotline": "+91 4262 261262 / Tamil Nadu Toll Free 1800-425-4545",
    "status": "PATROL_EN_ROUTE",
    "suggestedAction": "Mobilize RRT patrol with acoustic sirens.",
    "smsDispatchLog": "[ALERT-DISPATCHED] Wild animal incursion confirmed at O-Valley Tea Estate, Sector 4. Field team alerted.",
    "dispatchTime": "10:14:15 PM"
  }
}
```

#### Error Responses:
- `400 Bad Request`: `{"error": "Invalid dispatch payload"}`

---

### Planned / Roadmap API Endpoints [PLANNED]
The following endpoints represent the production backend roadmap when transitioning from client-state to a persistent database:

| Endpoint | Method | Status | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/cameras` | `GET`, `POST` | [PLANNED] | Fetch and register edge camera nodes. |
| `/api/cameras/:id/heartbeat` | `POST` | [PLANNED] | Ingest RTSP camera heartbeat & battery telemetry. |
| `/api/alerts/:ticketId/status`| `PATCH` | [PLANNED] | Update alert status (`ACKNOWLEDGED`, `RESOLVED`). |
| `/api/incidents` | `GET`, `POST` | [PLANNED] | CRUD operations for field incident management. |
| `/api/sightings/tracks` | `GET` | [PLANNED] | Retrieve time-series GIS movement vector sequences. |

---

## 🗄️ Database & Data Schema Documentation

The application utilizes high-performance, strictly typed in-memory and local data models defined in `src/types/surveillance.ts`. Below is the complete schema definition:

### 1. `CameraNode` (Camera Registry)
- **Purpose:** Stores physical sensor node metadata, power metrics, and streaming parameters.
- **Primary Key:** `id` (`string`)
- **Fields:**
  - `id`: `string` (PK, e.g. `'cam-gdl-01'`)
  - `name`: `string` (e.g. `'CCTV-01 [O-Valley Sector 4]'`)
  - `location`: `string` (Descriptive sector)
  - `sector`: `string` (Forest division sector)
  - `coordinates`: `[lat: number, lng: number]` (GPS tuple)
  - `status`: `'ONLINE' | 'STANDBY' | 'CALIBRATING' | 'OFFLINE'`
  - `batteryPercent`: `number` (0–100)
  - `solarStatus`: `'SOLAR_ACTIVE' | 'BATTERY_NIGHT' | 'HYBRID_GRID' | 'OFFLINE'`
  - `lowLightMode`: `'IR_NIGHT_VISION' | 'STARVIS_LOW_LIGHT' | 'THERMAL_IR' | 'DAYLIGHT_RGB'`
  - `currentLux`: `number` (Sensor illuminance reading, e.g. `0.02`)
  - `isPersonalCamera`: `boolean` (Flag for user's personal camera post)
  - `fovAngle`: `number` (Field of view in degrees)
  - `lastPing`: `string`
  - `lastHeartbeat`: `string` (Optional)
  - `riskZone`: `'HIGH_CONFLICT' | 'CORRIDOR' | 'HABITATION_FRINGE' | 'BUFFER_ZONE'`
  - `installedYear`: `number`
  - `streamType`: `'WEBCAM' | 'UPLOAD_VIDEO' | 'IP_CAMERA' | 'CCTV_RTSP' | 'DEMO_STREAM'` (Optional)
  - `rtspUrl`: `string` (Optional)
  - `resolution`: `string` (Optional)
  - `fps`: `number` (Optional)
  - `detectionStatus`: `'CLEAR' | 'ANIMAL_DETECTED' | 'HUMAN_DETECTED' | 'INVESTIGATING'` (Optional)
  - `isDemo`: `boolean` (Optional)

### 2. `DetectionEvent` (Detection Event Log)
- **Purpose:** Records every individual visual frame inference, human detection, or animal classification.
- **Primary Key:** `id` (`string`)
- **Foreign Key:** `cameraId` ➔ `CameraNode.id`
- **Fields:**
  - `id`: `string` (PK, e.g. `'evt-1741234567890'`)
  - `cameraId`: `string` (FK)
  - `cameraName`: `string`
  - `location`: `string`
  - `sector`: `string`
  - `coordinates`: `[number, number]`
  - `timestamp`: `string`
  - `detectedType`: `'wild_animal' | 'human' | 'none' | 'wild_animal_human_conflict' | 'vehicle'`
  - `species`: `string | null`
  - `confidence`: `number` (0–100)
  - `isLowLight`: `boolean`
  - `luxLevel`: `number`
  - `threatLevel`: `'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE' | 'LOW'`
  - `forestDeptAlertRequired`: `boolean`
  - `alertStatus`: `'NOT_REQUIRED' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'TEAM_MOBILIZED' | 'RESOLVED' | 'NEW' | 'INVESTIGATING' | 'FALSE_POSITIVE'`
  - `dispatchTicketId`: `string` (FK ➔ `ForestDeptAlert.ticketId`, Optional)
  - `boundingBoxes`: `BoundingBox[]` (Optional)
  - `animalCount`: `number` (Optional)
  - `humanPresence`: `boolean` (Optional)
  - `riskLevel`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'` (Optional)
  - `riskAssessment`: `RiskAssessment` (Optional)
  - `details`: `string`
  - `suggestedAction`: `string` (Optional)
  - `source`: `'my_camera' | 'cctv_network' | 'uploaded_video' | 'demo_simulation'`
  - `isDemoData`: `boolean` (Optional)

### 3. `ForestDeptAlert` (Smart Alert & Dispatch Tickets)
- **Purpose:** Official incident tickets dispatched to the Tamil Nadu Forest Department Rapid Response Team.
- **Primary Key:** `ticketId` (`string`)
- **Foreign Keys:** `eventId` ➔ `DetectionEvent.id`, `cameraId` ➔ `CameraNode.id`
- **Fields:**
  - `ticketId`: `string` (PK, e.g. `'TN-FD-GDL-2026-8812'`)
  - `division`: `string`
  - `rangeOffice`: `string`
  - `rrtUnit`: `string`
  - `eventId`: `string` (FK)
  - `cameraId`: `string` (FK)
  - `cameraName`: `string`
  - `species`: `string`
  - `threatLevel`: `ThreatLevel`
  - `riskLevel`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'` (Optional)
  - `exactCoordinates`: `string`
  - `location`: `string`
  - `timestamp`: `string`
  - `urgency`: `'IMMEDIATE' | 'PRIORITY' | 'ROUTINE'`
  - `assignedRFO`: `string`
  - `contactHotline`: `string`
  - `status`: `'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE' | 'DISPATCHED' | 'PATROL_EN_ROUTE' | 'ON_SITE_VERIFIED'`
  - `suggestedAction`: `string`
  - `smsDispatchLog`: `string`
  - `dispatchTime`: `string`
  - `confidence`: `number` (Optional)
  - `humanPresence`: `boolean` (Optional)
  - `animalCount`: `number` (Optional)
  - `riskExplanation`: `string` (Optional)
  - `riskAssessment`: `RiskAssessment` (Optional)
  - `resolutionNotes`: `string` (Optional)
  - `acknowledgedBy`: `string` (Optional)
  - `acknowledgedAt`: `string` (Optional)
  - `isDemoData`: `boolean` (Optional)

### 4. `IncidentRecord` (Field Incident Management)
- **Purpose:** Documented human-wildlife encounters, property/crop damage reports, and officer resolution notes.
- **Primary Key:** `id` (`string`)
- **Foreign Keys:** `alertId` ➔ `ForestDeptAlert.ticketId` (Optional), `cameraId` ➔ `CameraNode.id`
- **Fields:**
  - `id`: `string` (PK, e.g. `'INC-2026-001'`)
  - `alertId`: `string` (FK, Optional)
  - `dateTime`: `string`
  - `location`: `string`
  - `sector`: `string`
  - `coordinates`: `[number, number]`
  - `animal`: `string`
  - `severity`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
  - `description`: `string`
  - `evidenceUrl`: `string` (Optional)
  - `cameraId`: `string` (FK)
  - `assignedUser`: `string`
  - `status`: `'OPEN' | 'UNDER_INVESTIGATION' | 'MITIGATED' | 'CLOSED'`
  - `resolutionNotes`: `string` (Optional)
  - `isDemoData`: `boolean` (Optional)

### 5. `WildlifeSightingTrack` (Movement Sequence Vectors)
- **Purpose:** Temporal multi-camera sequential sightings modeling animal passage through corridors.
- **Primary Key:** `id` (`string`)
- **Foreign Key:** `cameraId` ➔ `CameraNode.id`
- **Fields:**
  - `id`: `string` (PK)
  - `species`: `string`
  - `location`: `string`
  - `sector`: `string`
  - `coordinates`: `[number, number]`
  - `timestamp`: `string`
  - `cameraId`: `string` (FK)
  - `cameraName`: `string`
  - `confidence`: `number`
  - `risk`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
  - `direction`: `string` (Heading description)
  - `headingDegrees`: `number` (Optional)
  - `sequenceOrder`: `number` (Step sequence index: 1, 2, 3...)
  - `isDemoData`: `boolean`

---

## 🔒 Security & Threat Model

1. **No Sensitive Tokens in Frontend:** API keys (such as `GEMINI_API_KEY`) are exclusively read on the server side via environment variables in `vite.config.ts`. No keys are injected into client-side JS bundles.
2. **Safe Error Masking:** Stack traces and internal implementation details are stripped before UI rendering in `ErrorBoundary.tsx`.
3. **Role-Based Access Control (RBAC):** UI action gates restrict incident creation, status resolution, and settings modification to authorized roles (`ADMIN`, `FOREST_OFFICER`, `CONTROL_ROOM_OPERATOR`).
4. **Input Sanitization:** User descriptions and notes are escaped during CSV/JSON export to prevent CSV injection (formula injection attacks).

---

## 🛠️ Troubleshooting

### 1. Error: `'vite' is not recognized as an internal or external command`
- **Cause:** `npm run dev` was run before installing node modules.
- **Fix:** Run `npm install` first.

### 2. Error: `Cannot find module 'react'` in VS Code
- **Cause:** VS Code TypeScript Language Server has not indexed the installed types.
- **Fix:** Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>, select **"TypeScript: Restart TS Server"**, and hit Enter.

### 3. Error: `Webcam permission or device error`
- **Cause:** Browser denied camera permissions or no physical webcam is plugged in.
- **Fix:** The system will automatically fall back to **DEMO CAMERA MODE**. If you have a webcam, click the lock icon in the browser address bar and grant camera permissions.

### 4. Port 3000 in use
- **Fix:** Run on another port:
  ```bash
  npx vite --port 5173
  ```

---

## 📐 Development Guidelines

- **TypeScript Strictness:** Maintain strict typing without `any` whenever possible. Standard enums and interfaces are maintained in `src/types/surveillance.ts`.
- **Styling Discipline:** All styling is implemented using Tailwind CSS utility classes. Avoid inline styles or separate CSS files.
- **Component Isolation:** Ensure new visual modules are wrapped in `<ErrorBoundary moduleName="...">`.
- **Testing Before Commits:** Run `npm test` and `npm run lint` before committing any changes.

---

## 🔮 Future Improvements & Roadmap

- [ ] **Edge YOLOv11 ONNX WebAssembly:** Run real-time animal detection directly on client browser CPU/GPU without sending frames to a server.
- [ ] **FLIR Thermal Hardware Integration:** Add radiometric temperature thresholding when real thermal hardware is connected.
- [ ] **Mesh LoRaWAN Telemetry:** Ingest solar battery and PIR triggers over long-range LoRaWAN radio packets across non-cellular forest valleys.
- [ ] **Automated Solar Fence Actuators:** Trigger pulse energizers automatically when elephant herd breaches buffer zones.
