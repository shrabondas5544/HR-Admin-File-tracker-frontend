"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, FileText, Folder as FolderIcon, Box, X, Loader2, Sparkles, Trash2, DoorClosed, DoorOpen } from "lucide-react";
import { searchArchive, fetchTrash } from "@/lib/api";
import { SearchResult } from "@/lib/types";

interface HeaderSearchProps {
  onSelectResult: (result: SearchResult) => void;
  onOpenSidebar: () => void;
  onOpenTrash: () => void;
  refreshTrigger?: number;
  allDoorsOpen?: boolean;
  onToggleAllDoors?: () => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  onSelectResult,
  onOpenSidebar,
  onOpenTrash,
  refreshTrigger,
  allDoorsOpen = true,
  onToggleAllDoors
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load trash count
  useEffect(() => {
    fetchTrash()
      .then((items) => setTrashCount(items.length))
      .catch(() => {});
  }, [refreshTrigger]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchArchive(query.trim());
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    onSelectResult(item);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-stone-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Digital Twin Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-stone-800 text-white shadow-md p-1.5">
            <img src="/logo.png" alt="CabinetMap Logo" className="w-full h-full object-contain invert" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              CabinetMap
            </h1>
            <p className="text-[10px] text-stone-400 font-medium tracking-wide">HR & Admin Archive</p>
          </div>
        </div>

        {/* Universal Search Bar */}
        <div className="flex-1 max-w-2xl relative" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-stone-400 pointer-events-none">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
              ) : (
                <Search className="w-5 h-5 text-stone-400" />
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              placeholder="Instant Universal Search: Employee Name, ID No, Dept, File Code, Magazine, Folder..."
              className="w-full pl-11 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-slate-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-400 shadow-inner transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                }}
                className="absolute right-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {!query && <span className="absolute right-3 text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">⌘K</span>}
          </div>

          {/* Instant Dropdown Results */}
          {isOpen && query.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {results.length === 0 && !loading ? (
                <div className="p-6 text-center text-stone-500 text-sm">
                  No records matching &quot;{query}&quot; found.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  <div className="px-3.5 py-2 bg-stone-50 text-[11px] font-semibold uppercase text-stone-500 flex items-center justify-between border-b border-stone-200">
                    <span>Search Matches ({results.length})</span>
                    <span className="flex items-center gap-1 text-stone-600 font-normal">
                      <Sparkles className="w-3.5 h-3.5" />
                      Click to auto-open cabinet doors
                    </span>
                  </div>
                  {results.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => handleSelect(res)}
                      className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 p-2 rounded-lg text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: res.colorHex || "#3b82f6" }}
                        >
                          {res.type === "File" && <FileText className="w-4 h-4" />}
                          {res.type === "Magazine" && <Box className="w-4 h-4" />}
                          {res.type === "Folder" && <FolderIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm group-hover:text-stone-600 transition-colors">
                              {res.title}
                            </span>
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-300">
                              {res.code}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5">{res.subtitle}</div>
                          {res.highlightField && (
                            <div className="text-[11px] text-stone-600 mt-1 font-mono">
                              Matched: {res.highlightField}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-stone-600" />
                        <span className="font-medium text-slate-900">{res.cabinetName}</span>
                        <span className="text-stone-400">•</span>
                        <span className="text-amber-700 font-bold">{res.shelfCode}</span>
                        <span className="text-stone-500 text-[11px]">({res.section})</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Trash (Icon + Count only), Door Toggle Icon, & Add Record */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Trash Icon + Count only */}
          <button
            onClick={onOpenTrash}
            title={`Recycle Bin (${trashCount} trashed items)`}
            className="flex items-center gap-1.5 px-2.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl border border-stone-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-stone-600" />
            <span
              className={`px-1.5 py-0.5 font-mono text-[10px] font-bold rounded-full ${
                trashCount > 0 ? "bg-red-600 text-white" : "bg-stone-200 text-stone-600"
              }`}
            >
              {trashCount}
            </span>
          </button>

          {/* Toggle All Doors Icon Button (Beside Add Record) */}
          {onToggleAllDoors && (
            <button
              onClick={onToggleAllDoors}
              title={allDoorsOpen ? "Close All Cabinet Doors" : "Open All Cabinet Doors"}
              className={`p-2 rounded-xl border shadow-2xs transition-all cursor-pointer flex items-center justify-center ${
                allDoorsOpen
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
              }`}
            >
              {allDoorsOpen ? (
                <DoorClosed className="w-4 h-4 text-amber-800" />
              ) : (
                <DoorOpen className="w-4 h-4 text-stone-700" />
              )}
            </button>
          )}

          {/* Add Record Button */}
          <button
            onClick={onOpenSidebar}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>+ Add Record</span>
          </button>
        </div>
      </div>
    </header>
  );
};
