"use client";

import React, { useState, useEffect } from "react";
import { ActivityLog } from "@/lib/types";
import { fetchActivityLogs } from "@/lib/api";
import { X, History, Search, Filter, RefreshCw, UserCheck, ArrowRightLeft, PlusCircle, Trash2, RotateCcw, Lock } from "lucide-react";

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchActivityLogs(searchQuery, selectedAction);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, selectedAction]);

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act === "MOVE" || act === "TRANSFER") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
          <ArrowRightLeft className="w-3 h-3" />
          <span>{act}</span>
        </span>
      );
    }
    if (act === "CREATE") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
          <PlusCircle className="w-3 h-3" />
          <span>CREATE</span>
        </span>
      );
    }
    if (act === "DELETE" || act === "PERMANENT_DELETE") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-100 text-rose-900 border border-rose-200 flex items-center gap-1">
          <Trash2 className="w-3 h-3" />
          <span>DELETE</span>
        </span>
      );
    }
    if (act === "RESTORE") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
          <RotateCcw className="w-3 h-3" />
          <span>RESTORE</span>
        </span>
      );
    }
    if (act === "LOGIN" || act === "REGISTER") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          <span>{act}</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-stone-100 text-stone-700 border border-stone-200">
        {act}
      </span>
    );
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 tracking-tight">Audit Activity History Log</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {logs.length} records
                </span>
              </div>
              <p className="text-xs text-stone-500">Track which user created, moved, transferred, or deleted files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-5 py-3 bg-stone-100/70 border-b border-stone-200 flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadLogs()}
              placeholder="Search by user name, email, designation, file code..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 placeholder-stone-400"
            />
          </div>

          {/* Action Type Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-medium"
          >
            <option value="">All Actions</option>
            <option value="MOVE">Move / Transfer</option>
            <option value="CREATE">Create Record</option>
            <option value="DELETE">Delete to Trash</option>
            <option value="RESTORE">Restore from Trash</option>
            <option value="LOGIN">User Login</option>
            <option value="REGISTER">User Register</option>
          </select>

          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Filter</span>
          </button>
        </div>

        {/* Audit Log Timeline Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-stone-400 font-medium">Loading audit trail history...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 select-none">
              <History className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-700 mb-1">No Activity Logs Found</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                No user actions match your search filter criteria.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-stone-50/80 hover:bg-stone-50 border border-stone-200 hover:border-amber-300 rounded-xl p-3.5 transition-all shadow-2xs flex flex-col gap-2 group"
              >
                {/* Header Row: User Info + Action Badge + Timestamp */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* User Gender Avatar Badge */}
                    <span className="w-7 h-7 rounded-full bg-stone-200/80 text-stone-800 flex items-center justify-center text-xs font-bold shadow-2xs">
                      {log.userGender === "Female" ? "👩‍💼" : "👨‍💼"}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900">{log.userName}</span>
                        {log.userDesignation && (
                          <span className="text-[10px] font-medium text-stone-600 bg-white border border-stone-200 px-1.5 py-0.2 rounded">
                            {log.userDesignation}
                          </span>
                        )}
                      </div>
                      {log.userEmail && <div className="text-[10px] text-stone-500">{log.userEmail}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getActionBadge(log.actionType)}
                    <span className="text-[11px] font-mono text-stone-400">{formatDate(log.timestamp)}</span>
                  </div>
                </div>

                {/* Audit Action Sentence */}
                <div className="text-xs text-stone-800 font-medium pl-9 leading-relaxed bg-white/60 p-2 rounded-lg border border-stone-200/60">
                  {log.details}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>All file movements, creations, and deletions are permanently logged</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
