import React from 'react';
import { ForestDeptAlert } from '../types/surveillance';
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
} from 'lucide-react';

interface ForestDepartmentAlertsProps {
  alerts: ForestDeptAlert[];
  onUpdateStatus: (ticketId: string, newStatus: ForestDeptAlert['status']) => void;
}

export const ForestDepartmentAlerts: React.FC<ForestDepartmentAlertsProps> = ({
  alerts,
  onUpdateStatus,
}) => {
  return (
    <div id="forest-department-dispatch-center" className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-700/60 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Tamil Nadu Forest Department Dispatch Portal</span>
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] px-2 py-0.2 rounded font-mono">
                GUDALUR RRT
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automated Early Warning & Rapid Response Team (RRT) Personal Checkup Queue
            </p>
          </div>
        </div>

        {/* Helpline Contact Bar */}
        <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>Control Room: 04262-261262</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span>Toll-Free: 1800-425-4545</span>
          </div>
        </div>
      </div>

      {/* Alert Tickets Feed */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500/50" />
            <p className="text-sm font-medium text-slate-400">No Active Wild Animal Alerts</p>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              All sectors in Gudalur are clear. When wild animals are detected in your camera, an urgent dispatch ticket is automatically created here.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.threatLevel === 'CRITICAL';
            return (
              <div
                key={alert.ticketId}
                id={`alert-ticket-${alert.ticketId}`}
                className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 space-y-3 hover:border-slate-700 transition-colors shadow-lg"
              >
                {/* Ticket Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                      TICKET #{alert.ticketId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCritical
                          ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {alert.threatLevel} THREAT
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {alert.species}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{alert.timestamp}</span>
                  </div>
                </div>

                {/* Location & Tactical Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400">Location:</span> {alert.location}
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                        GPS: {alert.exactCoordinates}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400">Assigned Unit:</span> {alert.rrtUnit}
                      <div className="text-[11px] text-slate-400">
                        {alert.rangeOffice}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Recommended for Personal Checkup */}
                <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 text-xs space-y-1">
                  <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Standard Operating Procedure (SOP):</span>
                  </div>
                  <p className="text-slate-300 text-xs pl-5">
                    {alert.suggestedAction}
                  </p>
                </div>

                {/* SMS & Radio Transmission Log */}
                <div className="text-[11px] font-mono bg-black/50 p-2 rounded text-slate-400 flex items-center justify-between">
                  <span className="text-emerald-400">
                    RADIO DISPATCH LOG: {alert.smsDispatchLog}
                  </span>
                  <span className="text-slate-500">{alert.dispatchTime}</span>
                </div>

                {/* Status Bar & Action Handlers */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded font-mono ${
                        alert.status === 'ON_SITE_VERIFIED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : alert.status === 'PATROL_EN_ROUTE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-red-950 text-red-300 border border-red-700'
                      }`}
                    >
                      {alert.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.status !== 'PATROL_EN_ROUTE' && alert.status !== 'ON_SITE_VERIFIED' && (
                      <button
                        id={`btn-ack-${alert.ticketId}`}
                        onClick={() => onUpdateStatus(alert.ticketId, 'PATROL_EN_ROUTE')}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs rounded transition-colors"
                      >
                        Acknowledge & Mobilize Patrol
                      </button>
                    )}

                    {alert.status !== 'ON_SITE_VERIFIED' && (
                      <button
                        id={`btn-verify-${alert.ticketId}`}
                        onClick={() => onUpdateStatus(alert.ticketId, 'ON_SITE_VERIFIED')}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs rounded transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Confirm Personal Checkup Done</span>
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
