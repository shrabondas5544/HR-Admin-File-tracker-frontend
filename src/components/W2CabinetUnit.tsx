"use client";

import React from "react";
import { Cabinet, Magazine, Folder, RecordFile } from "@/lib/types";
import { ShelfRow } from "./ShelfRow";

export type W2CabinetVariant = "3door-left-double" | "3door-right-double";

interface W2CabinetUnitProps {
  cabinet: Cabinet;
  variant: W2CabinetVariant;
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

export const W2CabinetUnit: React.FC<W2CabinetUnitProps> = ({
  cabinet,
  variant,
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

  const isLeftDouble = variant === "3door-left-double";

  return (
    <div
      id={`cabinet-${cabinet.cabinetNumber}`}
      className="flex-shrink-0 w-[360px] sm:w-[440px] md:w-[500px] flex flex-col bg-stone-100 border border-stone-300/80 rounded-lg overflow-hidden shadow-lg relative transition-all duration-300"
    >
      {/* Cabinet Header Plaque */}
      <div className="cabinet-header-texture border-b border-[#b09a76]/40 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-300/60">
          Wall 2
        </span>
        <h3 className="text-sm font-semibold text-stone-800 tracking-wide text-center drop-shadow-sm flex-1 mx-2">
          {cabinet.name}
        </h3>
        <span className="text-[10px] text-stone-600 font-medium">
          3-Door Modular
        </span>
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

        {/* Upper 3-Door Overlay */}
        <div
          className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
            isUpperOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
          }`}
          onClick={onToggleUpper}
        >
          {isLeftDouble ? (
            /* Variant A: Double door Left (Panels 1 & 2), Single door Right (Panel 3) */
            <>
              {/* Door 1 (Left of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/50 flex items-end justify-end pr-2 pb-10 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
                  isUpperOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 2 (Right of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/60 flex items-end justify-start pl-2 pb-10 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
                  isUpperOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 3 (Single Door on Right) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture flex items-end justify-start pl-2 pb-10 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
                  isUpperOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
              </div>
            </>
          ) : (
            /* Variant B: Single door Left (Panel 1), Double door Right (Panels 2 & 3) */
            <>
              {/* Door 1 (Single Door on Left) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/60 flex items-end justify-end pr-2 pb-10 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
                  isUpperOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 2 (Left of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/50 flex items-end justify-end pr-2 pb-10 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
                  isUpperOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 3 (Right of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture flex items-end justify-start pl-2 pb-10 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
                  isUpperOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
              </div>
            </>
          )}
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

        {/* Lower 3-Door Overlay */}
        <div
          className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
            isLowerOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
          }`}
          onClick={onToggleLower}
        >
          {isLeftDouble ? (
            /* Variant A: Double door Left (Panels 1 & 2), Single door Right (Panel 3) */
            <>
              {/* Door 1 (Left of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/50 flex items-center justify-end pr-2 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
                  isLowerOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 2 (Right of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/60 flex items-center justify-start pl-2 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
                  isLowerOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 3 (Single Door on Right) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture flex items-center justify-start pl-2 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
                  isLowerOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
              </div>
            </>
          ) : (
            /* Variant B: Single door Left (Panel 1), Double door Right (Panels 2 & 3) */
            <>
              {/* Door 1 (Single Door on Left) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/60 flex items-center justify-end pr-2 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
                  isLowerOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 2 (Left of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture border-r border-stone-400/50 flex items-center justify-end pr-2 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
                  isLowerOpen ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
              </div>

              {/* Door 3 (Right of Double Pair) */}
              <div
                className={`w-1/3 h-full cabinet-door-texture flex items-center justify-start pl-2 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
                  isLowerOpen ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
                }`}
              >
                <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full h-4 bg-gradient-to-b from-[#b09a76] to-[#9a8566] border-t border-[#b09a76]/50" />
    </div>
  );
};
