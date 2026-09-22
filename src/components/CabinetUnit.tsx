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
      className="flex-shrink-0 w-80 sm:w-84 md:w-96 flex flex-col bg-stone-100 border border-stone-300/80 rounded-lg overflow-hidden shadow-lg relative transition-all duration-300"
    >
      {/* Cabinet Header Plaque */}
      <div className="cabinet-header-texture border-b border-[#b09a76]/40 px-4 py-2.5 flex items-center justify-center shadow-xs">
        <h3 className="text-sm font-semibold text-stone-800 tracking-wide text-center drop-shadow-sm">{cabinet.name}</h3>
      </div>

      {/* UPPER SECTION */}
      <div className="relative border-b-2 border-stone-300/60 bg-white perspective-1000 min-h-[512px] flex flex-col justify-between">
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
              onToggleSection={onToggleUpper}
            />
          ))}
        </div>

        {/* Upper Double Doors Overlay - Click anywhere on door to open */}
        <div
          className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
            isUpperOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
          }`}
          onClick={onToggleUpper}
        >
          <div
            className={`w-1/2 h-full cabinet-door-texture border-r border-stone-400/50 flex items-end justify-end pr-2 pb-10 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
              isUpperOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
          </div>

          <div
            className={`w-1/2 h-full cabinet-door-texture border-l border-[#d4c4a8]/30 flex items-end justify-start pl-2 pb-10 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
              isUpperOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
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
              onToggleSection={onToggleLower}
            />
          ))}
        </div>

        {/* Lower Double Doors Overlay - Click anywhere on door to open */}
        <div
          className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
            isLowerOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
          }`}
          onClick={onToggleLower}
        >
          <div
            className={`w-1/2 h-full cabinet-door-texture border-r border-stone-400/50 flex items-center justify-end pr-2 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
              isLowerOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
          </div>

          <div
            className={`w-1/2 h-full cabinet-door-texture border-l border-[#d4c4a8]/30 flex items-center justify-start pl-2 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
              isLowerOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
            }`}
          >
            <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
          </div>
        </div>
      </div>

      <div className="w-full h-4 bg-gradient-to-b from-[#b09a76] to-[#9a8566] border-t border-[#b09a76]/50" />
    </div>
  );
};
