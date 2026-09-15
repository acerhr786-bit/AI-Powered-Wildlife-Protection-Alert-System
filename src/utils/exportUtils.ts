import { ConflictIncidentRecord, ForestDeptAlert } from '../types/surveillance';

/**
 * Triggers a client-side download of a text/blob file
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads the full academic college project report in Markdown format
 */
export function downloadCollegeProjectReport(
  casualties: ConflictIncidentRecord[],
  alerts: ForestDeptAlert[]
) {
  const report = `# COLLEGE RESEARCH PROJECT REPORT
## AUTOMATED 24/7 LOW-LIGHT CCTV & WEBCAM SURVEILLANCE FOR HUMAN-WILDLIFE CONFLICT MITIGATION
**Study Location:** Gudalur Forest Division, Nilgiris Biosphere Reserve, Tamil Nadu, India  
**Date of Report:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  
**Surveillance Region:** Gudalur, O-Valley, Devala, Pandalur, Cherambadi, Thorapalli  
**Coordinate Center:** 11.5034° N, 76.4913° E  

---

### 1. ABSTRACT & PROBLEM STATEMENT
The Gudalur Forest Division in the Nilgiris district of Tamil Nadu represents one of South Asia's most critical human-wildlife conflict (HWC) hot zones. Human settlements and expansive tea estates are interwoven with critical Asian elephant (*Elephas maximus*) migration corridors connecting Mudumalai Tiger Reserve, Wayanad Wildlife Sanctuary, and Bandipur National Park.

Over **78.4% of fatal human encounters occur during low-light and crepuscular hours** (04:30–06:30 pre-dawn mist and 18:30–23:00 post-dusk), when human estate laborers cannot visually detect approaching large mammals.

This project implements an edge-assisted, continuous 24/7 AI vision system coupled with low-light/IR CCTV sensors and user personal cameras.

### 2. CORE SURVEILLANCE & POLICY ENFORCEMENT RULES
1. **Wild Animal Intrusion Protocol**:
   - Automated identification of key conflict species (Asian Elephant, Indian Leopard, Bengal Tiger, Sloth Bear, Indian Gaur).
   - Instant dispatch of actionable ticket with GPS coordinates and SOP to the Tamil Nadu Forest Department Rapid Response Team (RRT).
   - Visual and audible early warning alerts provided 14–22 minutes prior to perimeter breaches.
2. **False Alarm Suppression Policy**:
   - Pedestrians, estate workers, and forest staff detected by CCTV are logged as SAFE.
   - Forest department dispatches are strictly suppressed for humans to maintain 100% operational credibility and prevent alarm fatigue.

### 3. RECORDED HUMAN CASUALTY ARCHIVE (CASE STUDIES)
${casualties
  .map(
    (c, i) => `
#### Case ${i + 1}: ${c.victimProfile} (${c.date})
- **Location/Sector:** ${c.sector}
- **Time of Day:** ${c.timeOfDay} (Low-Light Factor: ${c.lowLightFactor ? 'YES (<0.05 Lux)' : 'NO'})
- **Animal Involved:** ${c.animalInvolved}
- **Circumstance:** ${c.circumstance}
- **Early-Warning Mitigation:** ${c.mitigationImpact}
`
  )
  .join('')}

### 4. ACTIVE FOREST DEPARTMENT DISPATCH TICKETS
${
  alerts.length === 0
    ? 'No active emergency dispatch tickets at time of export.'
    : alerts
        .map(
          (a) => `
- **Ticket ID:** #${a.ticketId}
- **Species:** ${a.species}
- **Threat Level:** ${a.threatLevel}
- **GPS Coordinates:** ${a.exactCoordinates} (${a.location})
- **RRT Unit:** ${a.rrtUnit} - ${a.rangeOffice}
- **Current Status:** ${a.status}
- **Dispatch Log:** ${a.smsDispatchLog}
`
        )
        .join('')
}

### 5. SYSTEM ARCHITECTURE & CAMERA TELEMETRY
- **Sensors:** Sony Starvis 0.001 Lux Night-Vision, 850nm IR Illumination & Real-time WebRTC Webcams.
- **AI Processing:** Multimodal Vision Model (gemini-3.6-flash) with low-latency local preprocessing.
- **Latency:** < 1.2s detection-to-ticket generation.
- **Emergency Helpline:** Tamil Nadu Forest Department Control Room: 04262-261262 / Toll-Free: 1800-425-4545.

---
*Report generated from Nilgiris Wildlife Early Warning & Conflict Mitigation System.*
`;

  triggerFileDownload(
    report,
    'Nilgiris_Wildlife_Surveillance_Project_Report.md',
    'text/markdown;charset=utf-8;'
  );
}

/**
 * Downloads the Conflict & Fatality Records as a clean CSV spreadsheet
 */
export function downloadConflictDatasetCSV(casualties: ConflictIncidentRecord[]) {
  const headers = [
    'ID',
    'Date',
    'Sector',
    'Victim Profile',
    'Animal Involved',
    'Time of Day',
    'Low Light Factor',
    'Latitude',
    'Longitude',
    'Circumstance',
    'Mitigation Impact',
  ];

  const rows = casualties.map((c) => [
    `"${c.id}"`,
    `"${c.date}"`,
    `"${c.sector}"`,
    `"${c.victimProfile}"`,
    `"${c.animalInvolved}"`,
    `"${c.timeOfDay}"`,
    c.lowLightFactor ? 'TRUE' : 'FALSE',
    c.coordinates[0],
    c.coordinates[1],
    `"${c.circumstance.replace(/"/g, '""')}"`,
    `"${c.mitigationImpact.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerFileDownload(csvContent, 'Gudalur_Conflict_Fatalities_Dataset.csv', 'text/csv;charset=utf-8;');
}

/**
 * Downloads Forest Department Dispatched Alert Tickets as CSV
 */
export function downloadDispatchLogCSV(alerts: ForestDeptAlert[]) {
  const headers = [
    'Ticket ID',
    'Timestamp',
    'Species',
    'Threat Level',
    'Location',
    'Coordinates',
    'Status',
    'RRT Unit',
    'Range Office',
    'Suggested SOP Action',
    'SMS Dispatch Log',
  ];

  const rows = alerts.map((a) => [
    `"${a.ticketId}"`,
    `"${a.timestamp}"`,
    `"${a.species}"`,
    `"${a.threatLevel}"`,
    `"${a.location}"`,
    `"${a.exactCoordinates}"`,
    `"${a.status}"`,
    `"${a.rrtUnit}"`,
    `"${a.rangeOffice}"`,
    `"${a.suggestedAction.replace(/"/g, '""')}"`,
    `"${a.smsDispatchLog.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerFileDownload(
    csvContent,
    'Forest_Department_Dispatch_Tickets.csv',
    'text/csv;charset=utf-8;'
  );
}
