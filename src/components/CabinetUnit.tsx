"use client";

import React from "react";
import { Cabinet, Magazine, Folder, RecordFile } from "@/lib/types";
import { ShelfRow } from "./ShelfRow";

interface CabinetUnitProps {
  cabinet: Cabinet;
  isUpperOpen: boolean;
  isLowerOpen: boolean;
  onToggleUpper: () => void;
  onToggleLower: () => void;
  highlightedItem?: { type: string; id: number } | null;
  onOpenMagazine: (magazine: Magazine) => void;
  onInspectFolder: (folder: Folder) => void;
  onInspectFile: (file: RecordFile) => void;
  onMoveItem: (type: "Magazine" | "Folder" | "File", id: number) => void;
  onDeleteItem: (type: "Magazine" | "Folder" | "File", id: number, name: string, fileCount?: number) => void;
  onDropOnShelf: (e: React.DragEvent, shelfId: number, targetIndex?: number) => void;
  onDropInsideMagazine: (e: React.DragEvent, magazineId: number) => void;
  onReorderShelf?: (shelfId: number, items: Array<{ type: "Magazine" | "Folder" | "File"; id: number; orderIndex: number }>) => void;
}

export const CabinetUnit: React.FC<CabinetUnitProps> = ({
  cabinet,
  isUpperOpen,
  isLowerOpen,
  onToggleUpper,
  onToggleLower,
  highlightedItem,
  onOpenMagazine,
  onInspectFolder,
  onInspectFile,
  onMoveItem,
  onDeleteItem,
  onDropOnShelf,
  onDropInsideMagazine,
  onReorderShelf
}) => {
  const upperShelves = cabinet.shelves?.filter((s) => s.section === "Upper") || [];
  const lowerShelves = cabinet.shelves?.filter((s) => s.section === "Lower") || [];

  return (
    <div
      id={`cabinet-${cabinet.cabinetNumber}`}
      className="flex-shrink-0 w-80 sm:w-84 md:w-96 flex flex-col bg-slate-200 border-2 border-slate-300 rounded-lg overflow-hidden shadow-xl relative transition-all duration-300"
    >
      {/* Cabinet Header Plaque */}
      <div className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 border-b border-slate-300 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-600/40 text-amber-900 flex items-center justify-center font-mono font-bold text-xs">
            0{cabinet.cabinetNumber}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wide">{cabinet.name}</h3>
            <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{cabinet.description}</p>
          </div>
        </div>

        {/* Global Door Controls for this Cabinet */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleUpper}
            className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wider border transition-all cursor-pointer ${
              isUpperOpen
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            UPPER {isUpperOpen ? "OPEN" : "CLOSED"}
          </button>
          <button
            onClick={onToggleLower}
            className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wider border transition-all cursor-pointer ${
              isLowerOpen
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            LOWER {isLowerOpen ? "OPEN" : "CLOSED"}
          </button>
        </div>
      </div>

      {/* UPPER SECTION */}
      <div className="relative border-b-4 border-slate-300 bg-white perspective-1000 min-h-[512px] flex flex-col justify-between">
        <div className="w-full h-full flex flex-col justify-between shelf-interior-texture py-1">
          {upperShelves.map((shelf) => (
            <ShelfRow
              key={`shelf-${shelf.id}`}
              shelf={shelf}
              highlightedItem={highlightedItem}
              onOpenMagazine={onOpenMagazine}
              onInspectFolder={onInspectFolder}
              onInspectFile={onInspectFile}
              onMoveItem={onMoveItem}
              onDeleteItem={onDeleteItem}
              onDropOnShelf={onDropOnShelf}
              onDropInsideMagazine={onDropInsideMagazine}
              onReorderShelf={onReorderShelf}
            />
          ))}
        </div>

        {/* Upper Double Doors Overlay */}
        <div
          className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
            isUpperOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
          }`}
          onClick={onToggleUpper}
        >
          <div
            className={`w-1/2 h-full cabinet-door-texture border-r border-slate-400 flex flex-col justify-between p-3 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
              isUpperOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">UPPER LEFT</div>
            <div className="self-end mr-1 my-auto flex items-center">
              <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Shelves U1 - U4</div>
          </div>

          <div
            className={`w-1/2 h-full cabinet-door-texture border-l border-white/60 flex flex-col justify-between p-3 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
              isUpperOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider text-right">UPPER RIGHT</div>
            <div className="self-start ml-1 my-auto flex items-center">
              <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
            </div>
            <div className="text-[9px] text-slate-500 font-mono text-right">Click to Open</div>
          </div>
        </div>

      </div>

      {/* LOWER SECTION */}
      <div className="relative bg-white perspective-1000 min-h-[260px] flex flex-col justify-between">
        <div className="w-full h-full flex flex-col justify-between shelf-interior-texture py-1">
          {lowerShelves.map((shelf) => (
            <ShelfRow
              key={`shelf-${shelf.id}`}
              shelf={shelf}
              highlightedItem={highlightedItem}
              onOpenMagazine={onOpenMagazine}
              onInspectFolder={onInspectFolder}
              onInspectFile={onInspectFile}
              onMoveItem={onMoveItem}
              onDeleteItem={onDeleteItem}
              onDropOnShelf={onDropOnShelf}
              onDropInsideMagazine={onDropInsideMagazine}
              onReorderShelf={onReorderShelf}
            />
          ))}
        </div>

        {/* Lower Double Doors Overlay */}
        <div
          className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
            isLowerOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
          }`}
          onClick={onToggleLower}
        >
          <div
            className={`w-1/2 h-full cabinet-door-texture border-r border-slate-400 flex flex-col justify-between p-3 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
              isLowerOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">LOWER LEFT</div>
            <div className="self-end mr-1 my-auto flex items-center">
              <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Shelves L1 - L2</div>
          </div>

          <div
            className={`w-1/2 h-full cabinet-door-texture border-l border-white/60 flex flex-col justify-between p-3 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
              isLowerOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider text-right">LOWER RIGHT</div>
            <div className="self-start ml-1 my-auto flex items-center">
              <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
            </div>
            <div className="text-[9px] text-slate-500 font-mono text-right">Click to Open</div>
          </div>
        </div>

      </div>

      <div className="w-full h-4 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 border-t border-slate-400" />
    </div>
  );
};
