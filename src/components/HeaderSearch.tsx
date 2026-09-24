"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, FileText, Folder as FolderIcon, Box, X, Loader2, Sparkles, Trash2, DoorClosed, DoorOpen, History, User, Lock, LogOut, ChevronDown, Key } from "lucide-react";
import { searchArchive, fetchTrash } from "@/lib/api";
import { SearchResult, WallId, WALL_OPTIONS } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

// Custom Archive Storage Box Icon matching real archive transfer box
const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Lid */}
    <rect x="2.5" y="3" width="19" height="5" rx="1.5" />
    {/* Box Body */}
    <path d="M4.5 8v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8" />
    {/* Center Handle Slot */}
    <rect x="9.5" y="12" width="5" height="2" rx="1" strokeWidth="1.5" fill="currentColor" />
  </svg>
);

interface HeaderSearchProps {
  onSelectResult: (result: SearchResult) => void;
  onOpenSidebar: () => void;
  onOpenTrash: () => void;
  onDropTrash?: (type: "Magazine" | "Folder" | "File", id: number) => void;
  onOpenArchive: () => void;
  onDropArchive?: (type: "Magazine" | "Folder" | "File", id: number) => void;
  archiveCount?: number;
  refreshTrigger?: number;
  allDoorsOpen?: boolean;
  onToggleAllDoors?: () => void;
  selectedWall?: WallId;
  onSelectWall?: (wall: WallId) => void;
  onOpenActivityLogs?: () => void;
  onOpenAuthModal?: (mode?: "signin" | "register" | "changepassword") => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  onSelectResult,
  onOpenSidebar,
  onOpenTrash,
  onDropTrash,
  onOpenArchive,
  onDropArchive,
  archiveCount = 0,
  refreshTrigger = 0,
  allDoorsOpen = true,
  onToggleAllDoors,
  selectedWall = "W1",
  onSelectWall,
  onOpenActivityLogs,
  onOpenAuthModal
}) => {
  const { user, isLoggedIn, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [trashCount, setTrashCount] = useState(0);
  const [isDragOverTrash, setIsDragOverTrash] = useState(false);
  const [isDragOverArchive, setIsDragOverArchive] = useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load Trash items count to render live trash count badge
  useEffect(() => {
    fetchTrash()
      .then((items) => setTrashCount(items.length))
      .catch(() => {});
  }, [refreshTrigger]);

  // Global Ctrl+K / Cmd+K hotkey to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced Universal Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchArchive(query);
        setResults(res);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & System Subtitle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-stone-800 rounded-xl flex items-center justify-center shadow-xs">
            <DoorOpen className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-900 leading-tight tracking-tight">CabinetMap</h1>
            <p className="text-[10px] text-stone-400 font-medium tracking-wide">HR & Admin Archive</p>
          </div>
        </div>

        {/* Universal Search Bar */}
        <div ref={containerRef} className="relative flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Instant Universal Search: Employee Name, ID No, Dept, File Code, Magazine, Folder..."
              className="w-full pl-10 pr-20 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-400 text-stone-900 placeholder-stone-400 font-medium shadow-2xs transition-all"
            />
            {isLoading && <Loader2 className="w-4 h-4 text-stone-400 animate-spin absolute right-9 top-2.5" />}
            {query && !isLoading && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-9 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {!query && (
              <span className="absolute right-3 top-2 text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 select-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-stone-100">
              {results.length === 0 ? (
                <div className="p-4 text-center text-stone-400 text-xs font-medium">
                  No records or files match your search query "{query}".
                </div>
              ) : (
                <div className="py-1">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => {
                        onSelectResult(result);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-stone-50 transition-colors flex items-start gap-3 group cursor-pointer"
                    >
                      <div
                        className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5"
                        style={{ backgroundColor: result.colorHex || "#f59e0b" }}
                      >
                        {result.type === "File" && <FileText className="w-3.5 h-3.5" />}
                        {result.type === "Magazine" && <Box className="w-3.5 h-3.5" />}
                        {result.type === "Folder" && <FolderIcon className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900 truncate group-hover:text-stone-800">
                            {result.title}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            {result.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{result.subtitle}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Archive Box, Trash, Audit History, Add Record, Profile Badge, & Wall Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Archive Transfer Box (Drop Target for Wall-to-Wall Item Transfer) */}
          <button
            onClick={onOpenArchive}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setIsDragOverArchive(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragOverArchive(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverArchive(false);
              const rawData = e.dataTransfer.getData("application/json");
              if (!rawData) return;
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.type && parsed.id && onDropArchive) {
                  onDropArchive(parsed.type, parsed.id);
                }
              } catch (err) {
                console.error("Drop to archive failed:", err);
              }
            }}
            title={
              isDragOverArchive
                ? "Drop here to Hold in Archive Transfer Box"
                : `Archive Transfer Box (${archiveCount} held) • Drag items here to transfer between walls`
            }
            className={`flex items-center gap-1.5 px-2.5 py-2 font-semibold text-xs rounded-xl border shadow-2xs transition-all cursor-pointer ${
              isDragOverArchive
                ? "bg-amber-600 text-white border-amber-700 ring-4 ring-amber-300 scale-110 shadow-lg animate-pulse"
                : archiveCount > 0
                ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/40"
                : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
            }`}
          >
            <ArchiveBoxIcon
              className={`w-4 h-4 ${
                isDragOverArchive
                  ? "text-white animate-bounce"
                  : archiveCount > 0
                  ? "text-amber-700"
                  : "text-stone-600"
              }`}
            />
            {isDragOverArchive ? (
              <span className="font-bold text-[10px] uppercase tracking-wider text-white">Drop to Archive</span>
            ) : (
              <span
                className={`px-1.5 py-0.5 font-mono text-[10px] font-bold rounded-full ${
                  archiveCount > 0 ? "bg-amber-600 text-white" : "bg-stone-200 text-stone-600"
                }`}
              >
                {archiveCount}
              </span>
            )}
          </button>

          {/* Trash Icon + Count (Drop Target for Deletion) */}
          <button
            onClick={onOpenTrash}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setIsDragOverTrash(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragOverTrash(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverTrash(false);
              const rawData = e.dataTransfer.getData("application/json");
              if (!rawData) return;
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.type && parsed.id && onDropTrash) {
                  onDropTrash(parsed.type, parsed.id);
                }
              } catch (err) {
                console.error("Drop to trash failed:", err);
              }
            }}
            title={isDragOverTrash ? "Drop here to Move to Trash" : `Recycle Bin (${trashCount} trashed items) • Drag items here to delete`}
            className={`flex items-center gap-1.5 px-2.5 py-2 font-semibold text-xs rounded-xl border shadow-2xs transition-all cursor-pointer ${
              isDragOverTrash
                ? "bg-red-600 text-white border-red-700 ring-4 ring-red-300 scale-110 shadow-lg animate-pulse"
                : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
            }`}
          >
            <Trash2 className={`w-4 h-4 ${isDragOverTrash ? "text-white animate-bounce" : "text-stone-600"}`} />
            {isDragOverTrash ? (
              <span className="font-bold text-[10px] uppercase tracking-wider text-white">Drop to Delete</span>
            ) : (
              <span
                className={`px-1.5 py-0.5 font-mono text-[10px] font-bold rounded-full ${
                  trashCount > 0 ? "bg-red-600 text-white" : "bg-stone-200 text-stone-600"
                }`}
              >
                {trashCount}
              </span>
            )}
          </button>

          {/* Audit Activity History Log Button */}
          {onOpenActivityLogs && (
            <button
              onClick={onOpenActivityLogs}
              title="Audit Activity History Log (Who moved/deleted/created files)"
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 shadow-2xs transition-all cursor-pointer flex items-center justify-center"
            >
              <History className="w-4 h-4 text-stone-700" />
            </button>
          )}

          {/* Toggle All Doors Icon Button */}
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

          {/* USER PROFILE BADGE & DROPDOWN MENU - POSITIONED EXACTLY BETWEEN +ADD RECORD AND WALL BUTTONS */}
          <div ref={profileMenuRef} className="relative">
            {isLoggedIn && user ? (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title={`Account: ${user.fullName} (${user.designation})`}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                {/* Gender Avatar Icon */}
                <span className="w-6 h-6 rounded-full bg-amber-200/80 text-amber-950 flex items-center justify-center text-xs font-bold shrink-0">
                  {user.gender === "Female" ? "👩‍💼" : "👨‍💼"}
                </span>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-stone-900 leading-none">{user.fullName}</div>
                  <div className="text-[9px] text-amber-800 font-medium leading-tight truncate max-w-[100px]">
                    {user.designation}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal?.("signin")}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 shadow-2xs transition-all cursor-pointer"
              >
                <User className="w-4 h-4 text-stone-700" />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && isLoggedIn && user && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-stone-100 animate-in fade-in duration-150">
                {/* User Info Section */}
                <div className="p-3.5 bg-stone-50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
                      {user.gender === "Female" ? "👩‍💼" : "👨‍💼"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-900 truncate">{user.fullName}</div>
                      <div className="text-[11px] font-medium text-amber-800 truncate">{user.designation}</div>
                      <div className="text-[10px] text-stone-500 truncate">{user.email}</div>
                    </div>
                  </div>
                </div>

                {/* Actions Menu List */}
                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenActivityLogs?.();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-stone-500" />
                    <span>Audit Activity Log</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenAuthModal?.("changepassword");
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-stone-500" />
                    <span>Change Password</span>
                  </button>
                </div>

                {/* Logout Footer */}
                <div className="p-1.5 bg-stone-50/50">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wall Navigation: 4 Boxes (W1, W2, W3R, W3L) in the Right Corner */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-2xs gap-1 ml-1 shrink-0">
            {WALL_OPTIONS.map((wall) => {
              const isActive = selectedWall === wall.id;
              return (
                <button
                  key={wall.id}
                  onClick={() => onSelectWall?.(wall.id)}
                  title={`Switch to ${wall.fullName} (${wall.label})`}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-stone-900 shadow-xs border border-stone-300 ring-1 ring-stone-400/20"
                      : "text-stone-500 hover:text-stone-800 hover:bg-white/60"
                  }`}
                >
                  {wall.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
