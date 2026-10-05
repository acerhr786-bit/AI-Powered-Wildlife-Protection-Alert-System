import React, { useState } from 'react';
import { ForestDeptAlert, SmartAlertStatus } from '../types/surveillance';
import { alertService } from '../services/alertService';
import {
  ShieldAlert,
  Send,
  PhoneCall,
  Radio,
  Clock,
  MapPin,
  CheckCircle,
  AlertOctagon,
  FileText,
  UserCheck,
  Eye,
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  XCircle,
  Filter,
} from 'lucide-react';

interface ForestDepartmentAlertsProps {
  alerts: ForestDeptAlert[];
  onUpdateStatus: (ticketId: string, newStatus: SmartAlertStatus, notes?: string) => void;
  onViewEvidence?: (alert: ForestDeptAlert) => void;
  onViewOnMap?: (alert: ForestDeptAlert) => void;
}

export const ForestDepartmentAlerts: React.FC<ForestDepartmentAlertsProps> = ({
  alerts,
  onUpdateStatus,
  onViewEvidence,
  onViewOnMap,
}) => {
  const [selectedTicketForExplanation, setSelectedTicketForExplanation] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const integrations = alertService.getIntegrations();

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return a.status !== 'RESOLVED' && a.status !== 'FALSE_POSITIVE' && a.status !== 'ON_SITE_VERIFIED';
    return a.status === statusFilter;
  });

  return (
    <div id="forest-department-dispatch-center" className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4">
      {/* Top Header */}
      <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-700/60 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Smart Wildlife Early Warning & Dispatch Portal</span>
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] px-2 py-0.2 rounded font-mono">
                GUDALUR RRT
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Centralized alert dispatch, Rapid Response Team mobilization, and multi-channel notifications
            </p>
          </div>
        </div>

        {/* Helpline Contact Bar */}
        <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>Hotline: 04262-261262</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span>Toll-Free: 1800-425-4545</span>
          </div>
        </div>
      </div>

      {/* Integrations Status Bar (Upgrade 4) */}
      <div className="px-4 py-2 bg-slate-950/70 border-y border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Bell className="w-3.5 h-3.5 text-emerald-400" />
          <span>NOTIFICATION DISPATCH CHANNELS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          {integrations.map((ch) => {
            const isConf = ch.configured;
            return (
              <div
                key={ch.id}
                className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                title={ch.details}
              >
                {ch.id === 'sms' && <Smartphone className="w-3 h-3 text-cyan-400" />}
                {ch.id === 'whatsapp' && <MessageSquare className="w-3 h-3 text-emerald-400" />}
                {ch.id === 'email' && <Mail className="w-3 h-3 text-purple-400" />}
                {ch.id === 'browser' && <Bell className="w-3 h-3 text-amber-400" />}
                <span className="text-slate-300 capitalize">{ch.id}:</span>
                <span className={isConf ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {ch.statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Filter Ribbon */}
      <div className="px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
          <span className="text-slate-500 px-1.5">Filter:</span>
          {['ALL', 'ACTIVE', 'NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          {filteredAlerts.length} Alerts in View
        </span>
      </div>

      {/* Alert Tickets Feed */}
      <div className="p-4 pt-0 space-y-3 max-h-[550px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No alerts currently matching the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.threatLevel === 'CRITICAL' || alert.riskLevel === 'CRITICAL';
            const isHigh = alert.threatLevel === 'HIGH' || alert.riskLevel === 'HIGH';
            const isResolved = alert.status === 'RESOLVED' || alert.status === 'ON_SITE_VERIFIED';
            const isFalsePos = alert.status === 'FALSE_POSITIVE';
            const isExplaining = selectedTicketForExplanation === alert.ticketId;

            return (
              <div
                key={alert.ticketId}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isFalsePos
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : isResolved
                    ? 'bg-slate-950/80 border-emerald-900/40 text-slate-300'
                    : isCrit
                    ? 'bg-red-950/40 border-red-700/80 shadow-lg shadow-red-950/20'
                    : isHigh
                    ? 'bg-orange-950/30 border-orange-700/60'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        #{alert.ticketId}
                      </span>
                      {alert.isDemoData && (
                        <span className="bg-slate-800 text-amber-300 border border-slate-700 text-[9px] font-mono px-1.5 py-0.2 rounded">
                          DEMO DATA
                        </span>
                      )}
                      <span className="text-slate-400 text-xs font-mono">• {alert.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-0.5">{alert.species}</h4>
                    <span className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>{alert.location}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isCrit
                          ? 'bg-red-950 text-red-300 border-red-700'
                          : isHigh
                          ? 'bg-orange-950 text-orange-300 border-orange-700'
                          : 'bg-amber-950 text-amber-300 border-amber-700'
                      }`}
                    >
                      {alert.threatLevel}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        alert.status === 'NEW'
                          ? 'bg-red-900 text-red-200 border-red-700 animate-pulse'
                          : alert.status === 'INVESTIGATING'
                          ? 'bg-amber-900 text-amber-200 border-amber-700'
                          : isResolved
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : isFalsePos
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      {alert.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* SOP Suggested Action */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Rapid Response Action Protocol:</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{alert.suggestedAction}</p>
                </div>

                {/* AI Risk Explanation Panel (Upgrade 11) */}
                {(isCrit || isHigh || isExplaining) && alert.riskExplanation && (
                  <div className="bg-slate-950/90 p-3 rounded-lg border border-amber-900/50 space-y-1.5 text-xs">
                    <button
                      onClick={() =>
                        setSelectedTicketForExplanation(
                          isExplaining ? null : alert.ticketId
                        )
                      }
                      className="font-bold text-amber-300 flex items-center justify-between w-full text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why is this alert high risk? (AI Risk Engine Analysis)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isExplaining ? 'Hide Factors ▲' : 'Show Factors ▼'}
                      </span>
                    </button>
                    <p className="text-slate-300 leading-relaxed font-sans">{alert.riskExplanation}</p>

                    {isExplaining && alert.riskAssessment && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <div>• <b>Species:</b> {alert.riskAssessment.factors.speciesRisk}</div>
                        <div>• <b>Human Presence:</b> {alert.riskAssessment.factors.humanPresenceRisk}</div>
                        <div>• <b>Settlement Proximity:</b> {alert.riskAssessment.factors.settlementProximityRisk}</div>
                        <div>• <b>Time & Light:</b> {alert.riskAssessment.factors.timeOfDayRisk}</div>
                        <div>• <b>Historical Context:</b> {alert.riskAssessment.factors.historicalIncidentsRisk}</div>
                        <div>• <b>Location Zone:</b> {alert.riskAssessment.factors.locationZoneRisk}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Resolution Notes if available */}
                {alert.resolutionNotes && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/60 font-mono">
                    Notes: {alert.resolutionNotes}
                  </div>
                )}

                {/* Action Buttons (Upgrade 4: Acknowledge, Escalate, Investigate, Resolve, False Positive) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    {onViewEvidence && (
                      <button
                        onClick={() => onViewEvidence(alert)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>Evidence</span>
                      </button>
                    )}
                    {onViewOnMap && (
                      <button
                        onClick={() => onViewOnMap(alert)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Map</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {alert.status === 'NEW' && (
                      <button
                        onClick={() => onUpdateStatus(alert.ticketId, 'ACKNOWLEDGED')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}

                    {alert.status !== 'INVESTIGATING' && !isResolved && (
                      <button
                        onClick={() => onUpdateStatus(alert.ticketId, 'INVESTIGATING')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors"
                      >
                        Investigate
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() =>
                          onUpdateStatus(
                            alert.ticketId,
                            'RESOLVED',
                            'Field patrol team verified animal departed into core sanctuary. Area secure.'
                          )
                        }
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded transition-colors"
                      >
                        Resolve
                      </button>
                    )}

                    {!isFalsePos && (
                      <button
                        onClick={() =>
                          onUpdateStatus(
                            alert.ticketId,
                            'FALSE_POSITIVE',
                            'Verified as non-threatening cattle/wind shadow. False alarm logged.'
                          )
                        }
                        className="px-2 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 rounded transition-colors"
                        title="Mark False Positive"
                      >
                        False Positive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
