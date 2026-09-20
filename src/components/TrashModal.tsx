"use client";

import React, { useState, useEffect, useRef } from "react";
import { TrashItem } from "@/lib/types";
import { fetchTrash, restoreTrashItem, permanentlyDeleteTrashItem, emptyTrash } from "@/lib/api";
import { Trash2, RotateCcw, X, AlertOctagon, Clock, MapPin, FileText, Box, Folder as FolderIcon, Loader2, Filter, ChevronDown } from "lucide-react";

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemRestored: () => Promise<void>;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  onItemRestored
}) => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterType, setFilterType] = useState<"All" | "File" | "Magazine" | "Folder">("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const data = await fetchTrash();
      setTrashItems(data);
    } catch (err) {
      console.error("Failed to load trash:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrash();
      setFilterType("All");
      setIsFilterDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRestore = async (item: TrashItem) => {
    setActionLoading(true);
    try {
      await restoreTrashItem(item.type, item.id);
      await loadTrash();
      await onItemRestored();
    } catch (err: any) {
      alert("Restore failed: " + err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    if (!confirm(`Permanently delete this ${item.type.toLowerCase()}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await permanentlyDeleteTrashItem(item.type, item.id);
      await loadTrash();
    } catch (err: any) {
      alert("Delete failed: " + err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to empty the Trash? All items will be permanently erased.")) return;
    setActionLoading(true);
    try {
      await emptyTrash();
      await loadTrash();
    } catch (err: any) {
      alert("Empty trash failed: " + err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = trashItems.filter((item) => {
    if (filterType === "All") return true;
    return item.type.toLowerCase() === filterType.toLowerCase();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-wide">Recycle Bin / Trash</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {filterType === "All"
                    ? `${trashItems.length} ${trashItems.length === 1 ? "Item" : "Items"}`
                    : `${filteredItems.length} of ${trashItems.length} (${filterType}s)`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Items are stored for 30 days before automatic permanent deletion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  filterType !== "All"
                    ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                }`}
                title="Filter trash items by type"
              >
                <Filter className="w-3.5 h-3.5 text-amber-600" />
                <span>{filterType === "All" ? "Filter" : filterType}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {(["All", "File", "Magazine", "Folder"] as const).map((typeOption) => {
                    const count =
                      typeOption === "All"
                        ? trashItems.length
                        : trashItems.filter((i) => i.type.toLowerCase() === typeOption.toLowerCase()).length;
                    return (
                      <button
                        key={typeOption}
                        type="button"
                        onClick={() => {
                          setFilterType(typeOption);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-amber-50/70 transition-colors cursor-pointer ${
                          filterType === typeOption ? "font-bold text-amber-800 bg-amber-50" : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {typeOption === "File" && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                          {typeOption === "Magazine" && <Box className="w-3.5 h-3.5 text-purple-500" />}
                          {typeOption === "Folder" && <FolderIcon className="w-3.5 h-3.5 text-emerald-500" />}
                          <span>{typeOption === "All" ? "All Types" : typeOption}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {trashItems.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors cursor-pointer"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                Empty Trash
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trash Content List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-2">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600 mb-2" />
              <p className="text-xs">Loading trash items...</p>
            </div>
          ) : trashItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Trash2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">Trash is currently empty</p>
              <p className="text-slate-400 mt-1">Deleted files, folders, and magazines will appear here for 30 days</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Filter className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">No trashed {filterType.toLowerCase()}s found</p>
              <button
                type="button"
                onClick={() => setFilterType("All")}
                className="mt-2 text-amber-700 hover:underline font-semibold cursor-pointer"
              >
                Reset filter to Show All
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={`trash-${item.type}-${item.id}`}
                className="pt-3 pb-3 flex items-center justify-between hover:bg-slate-50 p-2.5 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="p-2 rounded-lg text-white shadow-xs shrink-0 mt-0.5"
                    style={{ backgroundColor: item.colorHex || "#64748b" }}
                  >
                    {item.type === "File" && <FileText className="w-4 h-4" />}
                    {item.type === "Magazine" && <Box className="w-4 h-4" />}
                    {item.type === "Folder" && <FolderIcon className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm truncate">
                        {item.title}
                      </span>
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {item.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">Prior: {item.originalLocation}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-700 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{item.daysRemaining} days left</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(item)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                    title="Delete Permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Auto-cleanup runs periodically on every trash view.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
