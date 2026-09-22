"use client";

import React, { useState } from "react";
import { Box, MoveRight, Trash2, GripVertical } from "lucide-react";
import { Magazine } from "@/lib/types";

interface MagazineSpineProps {
  magazine: Magazine;
  isHighlighted?: boolean;
  onClick: () => void;
  onMove: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const MagazineSpine: React.FC<MagazineSpineProps> = ({
  magazine,
  isHighlighted,
  onClick,
  onMove,
  onDelete,
  onDragStart,
  onDrop
}) => {
  const fileCount = magazine.files?.length || 0;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDropInternal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDrop) onDrop(e);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropInternal}
      onClick={onClick}
      title={`${magazine.name} (${magazine.code}) - ${fileCount} files inside • Drag to move or drop files inside`}
      className={`group relative h-28 w-12 sm:w-14 md:w-16 rounded-sm border cursor-grab active:cursor-grabbing select-none transition-all duration-200 transform hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between p-1.5 ${
        isDragOver
          ? "ring-4 ring-emerald-500 scale-105 border-emerald-400 z-30"
          : isHighlighted
          ? "pulse-target bounce-target ring-4 ring-amber-400 border-amber-300 z-30"
          : "border-black/30 hover:border-black/60"
      }`}
      style={{
        backgroundColor: magazine.colorHex || "#2563EB",
        boxShadow: "inset 2px 0 4px rgba(255,255,255,0.3), inset -2px 0 4px rgba(0,0,0,0.4), 2px 4px 8px rgba(0,0,0,0.3)"
      }}
    >
      {/* Top Label: Magazine Finger Hole & Code */}
      <div className="flex flex-col items-center">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-900/80 border border-white/40 shadow-inner flex items-center justify-center mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
        </div>
        <div className="bg-black/40 text-[9px] font-mono text-white/95 px-1 py-0.5 rounded text-center truncate max-w-full">
          {magazine.code.slice(-6)}
        </div>
      </div>

      {/* Middle Spine Title (Vertical) */}
      <div className="flex-1 flex items-center justify-center overflow-hidden py-1">
        <span
          className="text-[11px] font-bold text-white tracking-wider whitespace-nowrap drop-shadow-sm truncate"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            maxHeight: "68px"
          }}
        >
          {magazine.name}
        </span>
      </div>

      {/* Bottom Container File Counter */}
      <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px] text-white/95">
        <Box className="w-2.5 h-2.5 opacity-90" />
        <span className="font-bold font-mono">{fileCount}</span>
      </div>

      {/* Hover Quick Action Buttons */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-white border border-stone-200 shadow-md px-1.5 py-0.5 rounded z-40">
        <button
          onClick={onMove}
          title="Move Magazine to another shelf"
          className="p-1 text-stone-400 hover:text-amber-700 transition-colors"
        >
          <MoveRight className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          title="Delete Magazine (Move to Trash)"
          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
