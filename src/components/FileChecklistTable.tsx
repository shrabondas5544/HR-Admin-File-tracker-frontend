"use client";

import React from "react";
import { ChecklistItem } from "@/lib/types";
import { Check, X, FileCheck2, ClipboardList } from "lucide-react";

interface FileChecklistTableProps {
  checklist: ChecklistItem[];
  onChange?: (updated: ChecklistItem[]) => void;
  isReadOnly?: boolean;
}

export const FileChecklistTable: React.FC<FileChecklistTableProps> = ({
  checklist,
  onChange,
  isReadOnly = false
}) => {
  const handleStatusChange = (sn: number, newStatus: "YES" | "NO" | "NONE") => {
    if (isReadOnly || !onChange) return;
    const updated = checklist.map((item) => {
      if (item.sn === sn) {
        // Toggle off if already active
        const status = item.status === newStatus ? "NONE" : newStatus;
        return { ...item, status };
      }
      return item;
    });
    onChange(updated);
  };

  const handleRemarksChange = (sn: number, remarks: string) => {
    if (isReadOnly || !onChange) return;
    const updated = checklist.map((item) => {
      if (item.sn === sn) {
        return { ...item, remarks };
      }
      return item;
    });
    onChange(updated);
  };

  const handleSubItemToggle = (sn: number, subItemIndex: number) => {
    if (isReadOnly || !onChange) return;
    const updated = checklist.map((item) => {
      if (item.sn === sn && item.subItems) {
        const copySub = [...item.subItems];
        copySub[subItemIndex] = {
          ...copySub[subItemIndex],
          checked: !copySub[subItemIndex].checked
        };
        return { ...item, subItems: copySub };
      }
      return item;
    });
    onChange(updated);
  };

  const yesCount = checklist.filter((i) => i.status === "YES").length;
  const noCount = checklist.filter((i) => i.status === "NO").length;

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs text-xs">
      {/* Official Form Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-300 text-center relative">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
              Transcom Electronics Limited
            </h3>
            <p className="font-semibold text-amber-800 text-xs mt-0.5 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              Employee Personal File Checklist
            </p>
          </div>
          <div className="text-right">
            <span className="font-serif italic font-bold text-slate-700 text-sm tracking-wide">Index</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                {yesCount} Yes
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold">
                {noCount} No
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-300">
              <th className="py-2.5 px-3 w-10 text-center border-r border-slate-300">SN</th>
              <th className="py-2.5 px-4 border-r border-slate-300">Relevant Documents</th>
              <th className="py-2.5 px-3 w-36 text-center border-r border-slate-300">Check Box</th>
              <th className="py-2.5 px-4 w-48">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {checklist.map((item) => {
              const isSubItemRow = item.sn === 19;
              return (
                <tr
                  key={`chk-${item.sn}`}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.status === "YES"
                      ? "bg-emerald-50/20"
                      : item.status === "NO"
                      ? "bg-red-50/20"
                      : ""
                  }`}
                >
                  {/* SN */}
                  <td className="py-2 px-3 font-mono font-bold text-slate-600 text-center border-r border-slate-200 align-top">
                    {item.sn}
                  </td>

                  {/* Relevant Documents */}
                  <td className="py-2 px-4 border-r border-slate-200 align-top">
                    <span className="font-medium text-slate-900 leading-relaxed block">{item.name}</span>

                    {/* Sub-checkboxes for SN 19 (Personal Requisition Form) */}
                    {isSubItemRow && item.subItems && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-dashed border-slate-200">
                        {item.subItems.map((sub, sIdx) => (
                          <label
                            key={`sub-${sIdx}`}
                            className={`flex items-center gap-1.5 text-[11px] cursor-pointer select-none rounded px-1.5 py-0.5 border transition-all ${
                              sub.checked
                                ? "bg-amber-100 border-amber-400 text-amber-950 font-semibold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            } ${isReadOnly ? "cursor-default pointer-events-none" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={sub.checked}
                              disabled={isReadOnly}
                              onChange={() => handleSubItemToggle(item.sn, sIdx)}
                              className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                            />
                            <span>{sub.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Check Box (Yes / No) */}
                  <td className="py-2 px-2 text-center border-r border-slate-200 align-top">
                    {isReadOnly ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            item.status === "YES"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "text-slate-400 bg-slate-100"
                          }`}
                        >
                          <Check className="w-3 h-3" /> Yes
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            item.status === "NO"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "text-slate-400 bg-slate-100"
                          }`}
                        >
                          <X className="w-3 h-3" /> No
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.sn, "YES")}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer border ${
                            item.status === "YES"
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                              : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                          }`}
                          title="Mark Document as Available (Yes)"
                        >
                          <Check className="w-3 h-3" />
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.sn, "NO")}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer border ${
                            item.status === "NO"
                              ? "bg-red-600 text-white border-red-700 shadow-xs"
                              : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          }`}
                          title="Mark Document as Missing (No)"
                        >
                          <X className="w-3 h-3" />
                          <span>No</span>
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Remarks */}
                  <td className="py-2 px-3 align-top">
                    {isReadOnly ? (
                      <span className="text-slate-700 italic text-[11px] block truncate max-w-xs">
                        {item.remarks || "—"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleRemarksChange(item.sn, e.target.value)}
                        placeholder="Remarks / notes..."
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Official Form Footer */}
      <div className="bg-slate-50 p-3.5 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-2">
        <div className="font-semibold italic text-slate-700 text-left">
          Note: All the information must be provided as NID / Education Certificate&apos;s information.
        </div>
        <div className="font-mono text-slate-700 font-semibold shrink-0">
          Prepared and Checked: <span className="font-bold text-slate-900">Human Resource Department</span>
        </div>
      </div>
    </div>
  );
};
