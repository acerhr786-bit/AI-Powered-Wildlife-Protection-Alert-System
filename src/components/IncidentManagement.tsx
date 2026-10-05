import React, { useState } from 'react';
import { IncidentRecord, UserRole } from '../types/surveillance';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Plus,
  Filter,
  Download,
  Search,
  Eye,
  User,
  MapPin,
  Camera,
  X,
  Edit,
} from 'lucide-react';
import { downloadIncidentsCSV, downloadDatasetJSON } from '../utils/exportUtils';

interface IncidentManagementProps {
  incidents: IncidentRecord[];
  onUpdateIncident: (updated: IncidentRecord) => void;
  onCreateIncident: (newIncident: IncidentRecord) => void;
  onViewEvidence?: (incident: IncidentRecord) => void;
  currentRole: UserRole;
}

export const IncidentManagement: React.FC<IncidentManagementProps> = ({
  incidents,
  onUpdateIncident,
  onCreateIncident,
  onViewEvidence,
  currentRole,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // New incident form state
  const [formAnimal, setFormAnimal] = useState('Asian Elephant');
  const [formLocation, setFormLocation] = useState('O-Valley Tea Estate');
  const [formSector, setFormSector] = useState('O-Valley');
  const [formSeverity, setFormSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedUser, setFormAssignedUser] = useState('Forest Officer S. K. Murugan');
  const [formCameraId, setFormCameraId] = useState('cam-gdl-01');

  // Edit incident form state
  const [editStatus, setEditStatus] = useState<'OPEN' | 'UNDER_INVESTIGATION' | 'MITIGATED' | 'CLOSED'>('OPEN');
  const [editNotes, setEditNotes] = useState('');
  const [editAssigned, setEditAssigned] = useState('');

  const canEdit = currentRole === 'ADMIN' || currentRole === 'FOREST_OFFICER' || currentRole === 'CONTROL_ROOM_OPERATOR';

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.animal.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.assignedUser.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenEdit = (inc: IncidentRecord) => {
    setSelectedIncident(inc);
    setEditStatus(inc.status);
    setEditNotes(inc.resolutionNotes || '');
    setEditAssigned(inc.assignedUser);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    const updated: IncidentRecord = {
      ...selectedIncident,
      status: editStatus,
      resolutionNotes: editNotes,
      assignedUser: editAssigned,
    };
    onUpdateIncident(updated);
    setIsEditModalOpen(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: IncidentRecord = {
      id: `INC-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      dateTime: `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString()} IST`,
      location: formLocation,
      sector: formSector,
      coordinates: [11.5034, 76.4913],
      animal: formAnimal,
      severity: formSeverity,
      description: formDescription || 'Human-wildlife conflict incident reported via field patrol.',
      cameraId: formCameraId,
      assignedUser: formAssignedUser,
      status: 'OPEN',
      resolutionNotes: 'Initial incident report logged.',
      isDemoData: true,
    };
    onCreateIncident(newInc);
    setIsCreateModalOpen(false);
    setFormDescription('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-950/80 border border-rose-800/60 rounded-xl text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Wildlife Incident Management</h2>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                {incidents.length} RECORDS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Field case tracking, officer assignment, and mitigation logging for Gudalur Division
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-950"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Incident</span>
            </button>
          )}

          <button
            onClick={() => downloadIncidentsCSV(incidents)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => downloadDatasetJSON(incidents, 'Gudalur_Incidents_Dataset.json')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filters */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-1 font-mono text-[11px]">Status:</span>
            {['ALL', 'OPEN', 'UNDER_INVESTIGATION', 'MITIGATED', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-1 font-mono text-[11px]">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  severityFilter === sev
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search animal, location, officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3">Incident ID</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Animal Specimen</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Location & Sector</th>
                <th className="px-4 py-3">Assigned User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No incident records matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => {
                  const severityBadge =
                    inc.severity === 'CRITICAL'
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : inc.severity === 'HIGH'
                      ? 'bg-orange-950 text-orange-300 border-orange-800'
                      : inc.severity === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800';

                  const statusBadge =
                    inc.status === 'OPEN'
                      ? 'bg-red-900/60 text-red-200 border-red-700'
                      : inc.status === 'UNDER_INVESTIGATION'
                      ? 'bg-amber-900/60 text-amber-200 border-amber-700'
                      : inc.status === 'MITIGATED'
                      ? 'bg-emerald-900/60 text-emerald-200 border-emerald-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{inc.id}</span>
                          {inc.isDemoData && (
                            <span className="text-[9px] bg-slate-800 text-amber-400 px-1 py-0.2 rounded border border-slate-700">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{inc.dateTime}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{inc.animal}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityBadge}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{inc.location}</div>
                        <div className="text-[10px] text-slate-500">{inc.sector}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-300">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{inc.assignedUser}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge}`}>
                          {inc.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onViewEvidence && (
                            <button
                              onClick={() => onViewEvidence(inc)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                              title="View Evidence Snapshot"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(inc)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                              title="Edit Resolution & Status"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Incident Modal */}
      {isEditModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Update Incident #{selectedIncident.id}</h3>
                <p className="text-xs text-slate-400">{selectedIncident.animal} • {selectedIncident.location}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="MITIGATED">MITIGATED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Assigned Officer</label>
                <input
                  type="text"
                  value={editAssigned}
                  onChange={(e) => setEditAssigned(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Resolution & Mitigation Notes</label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Detail deterrence actions, siren deployment, animal trajectory..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log New Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Log New Wildlife Incident</h3>
                <p className="text-xs text-slate-400">Manual incident dispatch entry</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">Animal Involved</label>
                  <select
                    value={formAnimal}
                    onChange={(e) => setFormAnimal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="Asian Elephant">Asian Elephant</option>
                    <option value="Indian Leopard">Indian Leopard</option>
                    <option value="Bengal Tiger">Bengal Tiger</option>
                    <option value="Sloth Bear">Sloth Bear</option>
                    <option value="Indian Gaur (Bison)">Indian Gaur (Bison)</option>
                    <option value="Wild Boar">Wild Boar</option>
                    <option value="Other Specimen">Other Specimen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={(e: any) => setFormSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">Sector</label>
                  <input
                    type="text"
                    value={formSector}
                    onChange={(e) => setFormSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Assigned Officer</label>
                <input
                  type="text"
                  value={formAssignedUser}
                  onChange={(e) => setFormAssignedUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Circumstances of incident, proximity to labor quarters, property damage..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
