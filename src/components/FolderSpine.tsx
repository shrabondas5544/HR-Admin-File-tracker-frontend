"use client";

import React from "react";
import { Folder as FolderIcon, Paperclip, MoveRight, Trash2 } from "lucide-react";
import { Folder } from "@/lib/types";

interface FolderSpineProps {
  folder: Folder;
  isHighlighted?: boolean;
  onClick: () => void;
  onMove: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export const FolderSpine: React.FC<FolderSpineProps> = ({
  folder,
  isHighlighted,
  onClick,
  onMove,
  onDelete,
  onDragStart
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={`${folder.name} (${folder.code}) - Standalone Binder • Drag to move shelf`}
      className={`group relative h-28 w-9 sm:w-11 rounded-sm border cursor-grab active:cursor-grabbing select-none transition-all duration-200 transform hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between p-1 ${
        isHighlighted
          ? "pulse-target bounce-target ring-4 ring-amber-400 border-amber-300 z-30"
          : "border-black/30 hover:border-black/60"
      }`}
      style={{
        backgroundColor: folder.colorHex || "#10B981",
        boxShadow: "inset 2px 0 3px rgba(255,255,255,0.4), inset -2px 0 3px rgba(0,0,0,0.3), 2px 3px 6px rgba(0,0,0,0.25)"
      }}
    >
      {/* Top spine label card */}
      <div className="flex flex-col items-center">
        <div className="w-full bg-white/95 text-slate-900 text-[8px] font-mono font-bold px-0.5 py-0.5 rounded text-center truncate shadow-xs">
          {folder.code.slice(-6)}
        </div>
      </div>

      {/* Middle Folder Title (Vertical) */}
      <div className="flex-1 flex items-center justify-center overflow-hidden py-1">
        <span
          className="text-[10px] font-bold text-white tracking-wider whitespace-nowrap drop-shadow-sm truncate"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            maxHeight: "70px"
          }}
        >
          {folder.name}
        </span>
      </div>

      {/* Bottom Binder Ring / Attachment icon */}
      <div className="flex items-center justify-center pt-1 border-t border-white/20 text-white/90">
        {folder.attachmentUrl ? (
          <Paperclip className="w-3 h-3 text-amber-200" />
        ) : (
          <FolderIcon className="w-3 h-3 opacity-90" />
        )}
      </div>

      {/* Hover Quick Action Buttons */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-lg z-40">
        <button
          onClick={onMove}
          title="Move Folder to another shelf"
          className="p-1 text-slate-500 hover:text-amber-700 transition-colors"
        >
          <MoveRight className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          title="Delete Folder (Move to Trash)"
          className="p-1 text-slate-500 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
