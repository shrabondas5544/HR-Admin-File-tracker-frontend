"use client";

import React from "react";
import { FileText, Paperclip, MoveRight, Trash2 } from "lucide-react";
import { RecordFile } from "@/lib/types";

interface StandaloneFileSpineProps {
  file: RecordFile;
  isHighlighted?: boolean;
  onClick: () => void;
  onMove: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export const StandaloneFileSpine: React.FC<StandaloneFileSpineProps> = ({
  file,
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
      title={`${file.title} (${file.code}) - Standalone File Dossier • Drag onto any shelf or magazine box`}
      className={`group relative h-26 w-6 sm:w-7 rounded-sm border cursor-grab active:cursor-grabbing select-none transition-all duration-200 transform hover:-translate-y-1.5 hover:shadow-lg flex flex-col justify-between p-0.5 ${
        isHighlighted
          ? "pulse-target bounce-target ring-4 ring-amber-500 border-amber-400 z-30"
          : "border-stone-200 hover:border-amber-400"
      }`}
      style={{
        backgroundColor: "#51C4EC",
        boxShadow: "inset 1px 0 2px rgba(255,255,255,0.8), inset -1px 0 2px rgba(0,0,0,0.1), 1px 2px 4px rgba(0,0,0,0.15)"
      }}
    >
      <div className="w-full bg-slate-900 text-white text-[7px] font-mono font-bold py-0.5 rounded-t text-center truncate">
        {file.code.slice(-5)}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden py-1">
        <span
          className="text-[9px] font-semibold text-slate-950 font-bold tracking-wider whitespace-nowrap truncate"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            maxHeight: "55px"
          }}
        >
          {file.title}
        </span>
      </div>

      <div className="flex items-center justify-center pb-0.5 text-slate-900">
        {file.attachmentUrl ? (
          <Paperclip className="w-2.5 h-2.5 text-amber-600" />
        ) : (
          <FileText className="w-2.5 h-2.5" />
        )}
      </div>

      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-white border border-stone-200 shadow-md px-1 py-0.5 rounded z-40">
        <button
          onClick={onMove}
          title="Move File"
          className="p-0.5 text-slate-900 hover:text-amber-600 transition-colors"
        >
          <MoveRight className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={onDelete}
          title="Delete File (Move to Trash)"
          className="p-0.5 text-slate-900 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
