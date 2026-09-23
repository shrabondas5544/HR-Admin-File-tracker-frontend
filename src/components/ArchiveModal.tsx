"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArchiveHeldItem, FlatShelf, WallId } from "@/lib/types";
import {
  X,
  FileText,
  Box,
  Folder as FolderIcon,
  GripVertical,
  RotateCcw,
  Sparkles
} from "lucide-react";

// Custom Archive Storage Box Icon matching real archive transfer box
const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2.5" y="3" width="19" height="5" rx="1.5" />
    <path d="M4.5 8v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8" />
    <rect x="9.5" y="12" width="5" height="2" rx="1" strokeWidth="1.5" fill="currentColor" />
  </svg>
);

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ArchiveHeldItem[];
  flatShelves: FlatShelf[];
  selectedWall?: WallId;
  onPlaceItem: (item: ArchiveHeldItem, targetShelfId: number) => Promise<void>;
  onReturnItem: (item: ArchiveHeldItem) => Promise<void>;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  items,
  flatShelves,
  selectedWall = "W1",
  onPlaceItem,
  onReturnItem
}) => {
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Window dragend listener ensures isDragging resets reliably
  useEffect(() => {
    const handleDragEnd = () => setIsDragging(false);
    window.addEventListener("dragend", handleDragEnd);
    return () => window.removeEventListener("dragend", handleDragEnd);
  }, []);

  // Filter shelves to ONLY show shelves belonging to the active wall
  const wallFilteredShelves = useMemo(() => {
    if (selectedWall === "W1") {
      return flatShelves.filter((s) => s.cabinetNumber >= 1 && s.cabinetNumber <= 6);
    }
    if (selectedWall === "W2") {
      return flatShelves.filter((s) => s.cabinetNumber === 7 || s.cabinetNumber === 8);
    }
    if (selectedWall === "W3R" || selectedWall === "W3L") {
      return [];
    }
    return flatShelves;
  }, [flatShelves, selectedWall]);

  if (!isOpen) return null;

  const handlePlace = async (item: ArchiveHeldItem, targetShelfId: number) => {
    const itemKey = `${item.type}-${item.id}`;
    setPlacingId(itemKey);
    try {
      await onPlaceItem(item, targetShelfId);
    } catch (err: any) {
      alert("Failed to place item: " + (err?.message || "Unknown error"));
    } finally {
      setPlacingId(null);
    }
  };

  const handleReturn = async (item: ArchiveHeldItem) => {
    const itemKey = `${item.type}-${item.id}`;
    setPlacingId(itemKey);
    try {
      await onReturnItem(item);
    } catch (err: any) {
      alert("Failed to return item: " + (err?.message || "Unknown error"));
    } finally {
      setPlacingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 pointer-events-none">
      {/* Light Backdrop - Click outside to close. During drag, completely click-through so shelves receive drag events */}
      <div
        className={`fixed inset-0 transition-all duration-200 ${
          isDragging
            ? "opacity-0 pointer-events-none"
            : "bg-stone-900/20 backdrop-blur-[1px] pointer-events-auto"
        }`}
        onClick={onClose}
      />

      {/* Floating Transfer Panel - When dragging, becomes semi-transparent & click-through so shelves underneath are droppable */}
      <div
        className={`relative w-full max-w-lg bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col transition-all duration-200 max-h-[90vh] ${
          isDragging
            ? "opacity-20 pointer-events-none scale-95"
            : "opacity-100 pointer-events-auto scale-100"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <ArchiveBoxIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 tracking-tight">Archive Transfer Box</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-xs text-stone-500">Hold items to move between Wall 1, Wall 2, or any cabinet shelf</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tip / How-To Banner */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>How to place on {selectedWall}:</strong> Drag any card directly onto a shelf, or select a shelf in the dropdown.
          </span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 px-4 select-none">
              <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 mx-auto mb-3">
                <ArchiveBoxIcon className="w-8 h-8 text-stone-400" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 mb-1">Archive Transfer Box is Empty</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Drag and drop any file, folder, or magazine onto the Archive Box icon in the top header to store it here for moving between walls.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const itemKey = `${item.type}-${item.id}`;
              const isProcessing = placingId === itemKey;

              return (
                <div
                  key={itemKey}
                  draggable={!isProcessing}
                  onDragStart={(e) => {
                    setIsDragging(true);
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({
                        type: item.type,
                        id: item.id,
                        fromArchive: true
                      })
                    );
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setIsDragging(false);
                  }}
                  className="bg-stone-50/80 hover:bg-stone-50 border border-stone-200 hover:border-amber-400/80 rounded-xl p-3.5 shadow-2xs transition-all flex flex-col gap-3 group cursor-grab active:cursor-grabbing"
                >
                  {/* Top Bar: Drag Grip + Icon + Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="text-stone-400 group-hover:text-amber-600 pt-1 shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div
                        className="w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: item.colorHex || "#3b82f6" }}
                      >
                        {item.type === "File" && <FileText className="w-4 h-4" />}
                        {item.type === "Magazine" && <Box className="w-4 h-4" />}
                        {item.type === "Folder" && <FolderIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-stone-900">{item.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-stone-700 border border-stone-200">
                            {item.code}
                          </span>
                          <span className="text-[10px] font-medium text-stone-500 uppercase">
                            ({item.type})
                          </span>
                        </div>
                        {item.originLocationName && (
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            Original location: <span className="font-medium text-stone-700">{item.originLocationName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar: Target Shelf Selector (Filtered by Current Wall) + Return Button */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60">
                    <div className="flex-1">
                      <select
                        defaultValue=""
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handlePlace(item, Number(val));
                          }
                        }}
                        disabled={isProcessing || wallFilteredShelves.length === 0}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
                      >
                        <option value="" disabled>
                          {wallFilteredShelves.length > 0
                            ? `Move to shelf on ${selectedWall}...`
                            : `No shelves available on ${selectedWall}`}
                        </option>
                        {wallFilteredShelves.map((s) => (
                          <option key={`opt-${itemKey}-${s.id}`} value={s.id}>
                            {s.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Return Button (Restores item back to where it was taken from) */}
                    <button
                      type="button"
                      onClick={() => handleReturn(item)}
                      disabled={isProcessing || !item.originShelfId}
                      title={
                        item.originLocationName
                          ? `Return to: ${item.originLocationName}`
                          : "Return to where this file was taken from"
                      }
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Items remain held until placed on a shelf or returned</span>
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
