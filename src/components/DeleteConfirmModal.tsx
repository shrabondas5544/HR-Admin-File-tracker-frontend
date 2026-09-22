"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X, RotateCcw, Box, Layers, CheckCircle2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: {
    type: "File" | "Magazine" | "Folder";
    id: number;
    name: string;
    fileCount?: number;
  } | null;
  onClose: () => void;
  onConfirm: (deleteContents?: boolean) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);
  const [magazineOption, setMagazineOption] = useState<"all" | "box_only">("all");

  useEffect(() => {
    if (isOpen) {
      setMagazineOption("all");
      setLoading(false);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const isMagazineWithFiles = item.type === "Magazine" && (item.fileCount || 0) > 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const deleteContents = magazineOption === "all";
      await onConfirm(deleteContents);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Delete failed: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-red-50/80 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Move to Trash</h3>
              <p className="text-[11px] text-stone-500">Confirm item removal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-700 leading-relaxed">
            Are you sure you want to delete this <strong className="text-stone-900">{item.type.toLowerCase()}</strong>?
          </p>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                {item.type}
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {item.name}
              </span>
            </div>
            {item.type === "Magazine" && (
              <span className="text-xs font-mono text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded shrink-0">
                {item.fileCount || 0} files inside
              </span>
            )}
          </div>

          {/* Magazine with Files Smart Options */}
          {isMagazineWithFiles && (
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                How should the files inside this magazine be handled?
              </label>

              {/* Option 1: Delete whole thing */}
              <div
                onClick={() => setMagazineOption("all")}
                className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  magazineOption === "all"
                    ? "bg-red-50/50 border-red-500 shadow-xs"
                    : "bg-white border-stone-200 hover:border-stone-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    magazineOption === "all" ? "border-red-600 bg-red-600 text-white" : "border-stone-200 bg-white"
                  }`}
                >
                  {magazineOption === "all" && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                    <Layers className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete Whole Thing (Magazine + {item.fileCount} Enclosed Files)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Moves both the magazine box and all <strong>{item.fileCount} files</strong> inside it into the 30-day Recycle Bin.
                  </p>
                </div>
              </div>

              {/* Option 2: Delete box only, keep files on shelf */}
              <div
                onClick={() => setMagazineOption("box_only")}
                className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  magazineOption === "box_only"
                    ? "bg-amber-50/70 border-amber-500 shadow-xs"
                    : "bg-white border-stone-200 hover:border-stone-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                    magazineOption === "box_only" ? "border-amber-600 bg-amber-600 text-white" : "border-stone-200 bg-white"
                  }`}
                >
                  {magazineOption === "box_only" && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                    <Box className="w-3.5 h-3.5 text-amber-600" />
                    <span>Delete Magazine Box Only (Keep Files on Shelf)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Deletes only the container box to Trash. All <strong>{item.fileCount} files</strong> will remain safe directly on this shelf as standalone files.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 30-day Recycle Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-normal">
              Deleted items are preserved in the <strong>Trash</strong> for <strong>30 days</strong>, where you can restore them at any time. After 30 days, they are automatically purged.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {loading ? "Deleting..." : "Confirm & Move to Trash"}
          </button>
        </div>
      </div>
    </div>
  );
};
