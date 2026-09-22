"use client";

import React, { useState, useEffect } from "react";
import { ChecklistItem } from "@/lib/types";
import { FileChecklistTable } from "./FileChecklistTable";
import { X, ClipboardList, CheckCircle2, User, FileText } from "lucide-react";

interface FileChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: ChecklistItem[];
  onChange?: (updated: ChecklistItem[]) => void;
  onSaveAndClose?: (updated: ChecklistItem[]) => Promise<void> | void;
  isReadOnly?: boolean;
  employeeName?: string;
  fileCode?: string;
  documentTypeName?: string;
}

export const FileChecklistModal: React.FC<FileChecklistModalProps> = ({
  isOpen,
  onClose,
  checklist,
  onChange,
  onSaveAndClose,
  isReadOnly = false,
  employeeName,
  fileCode,
  documentTypeName
}) => {
  // Local state to allow local edits and then committing on close
  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>(checklist);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalChecklist(checklist);
  }, [checklist, isOpen]);

  if (!isOpen) return null;

  const handleTableChange = (updated: ChecklistItem[]) => {
    setLocalChecklist(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleDone = async () => {
    if (onSaveAndClose) {
      setIsSaving(true);
      try {
        await onSaveAndClose(localChecklist);
      } finally {
        setIsSaving(false);
      }
    }
    onClose();
  };

  const yesCount = localChecklist.filter((i) => i.status === "YES").length;
  const noCount = localChecklist.filter((i) => i.status === "NO").length;
  const pendingCount = localChecklist.filter((i) => i.status === "NONE").length;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-stone-900">
                  Employee Personal File Checklist / Index
                </h2>
                {documentTypeName && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                    {documentTypeName}
                  </span>
                )}
                {fileCode && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                    {fileCode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                <span>Transcom Electronics Limited</span>
                {employeeName && (
                  <span className="flex items-center gap-1 font-medium text-stone-800">
                    <User className="w-3 h-3 text-amber-600" />
                    {employeeName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status Indicators */}
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                ✓ {yesCount} Yes
              </span>
              <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-800 border border-red-300 font-bold">
                ✗ {noCount} No
              </span>
              <span className="px-2 py-1 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                {pendingCount} Unchecked
              </span>
            </div>

            <button
              onClick={handleDone}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Spacious Full Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Select <strong>Yes</strong> if document is enclosed, <strong>No</strong> if missing/pending, and add relevant remarks.
              </span>
            </div>
            <div className="sm:hidden font-mono font-bold text-[11px]">
              {yesCount} Yes · {noCount} No
            </div>
          </div>

          <FileChecklistTable
            checklist={localChecklist}
            onChange={handleTableChange}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-500 hidden sm:block">
            {isReadOnly ? "Viewing in read-only mode." : "Changes are applied to this file automatically."}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={handleDone}
              disabled={isSaving}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Done & Apply to File"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

