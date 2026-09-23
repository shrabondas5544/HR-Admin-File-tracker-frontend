"use client";

import React from "react";
import { Cabinet, Shelf, Magazine, Folder, RecordFile } from "@/lib/types";
import { ShelfRow } from "./ShelfRow";

export type W2CabinetVariant = "3door-left-double" | "3door-right-double";

interface W2CabinetUnitProps {
  cabinet: Cabinet;
  variant: W2CabinetVariant;
  isUpperDoubleOpen?: boolean;
  isUpperSingleOpen?: boolean;
  isLowerDoubleOpen?: boolean;
  isLowerSingleOpen?: boolean;
  onToggleUpperDouble?: () => void;
  onToggleUpperSingle?: () => void;
  onToggleLowerDouble?: () => void;
  onToggleLowerSingle?: () => void;
  isUpperOpen?: boolean;
  isLowerOpen?: boolean;
  onToggleUpper?: () => void;
  onToggleLower?: () => void;
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
  isUpperDoubleOpen,
  isUpperSingleOpen,
  isLowerDoubleOpen,
  isLowerSingleOpen,
  onToggleUpperDouble,
  onToggleUpperSingle,
  onToggleLowerDouble,
  onToggleLowerSingle,
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
  const isLeftDouble = variant === "3door-left-double";

  // Effective door open states
  const openUpperDouble = isUpperDoubleOpen ?? isUpperOpen ?? true;
  const openUpperSingle = isUpperSingleOpen ?? isUpperOpen ?? true;
  const openLowerDouble = isLowerDoubleOpen ?? isLowerOpen ?? true;
  const openLowerSingle = isLowerSingleOpen ?? isLowerOpen ?? true;

  // Toggle handlers
  const handleToggleUpperDouble = onToggleUpperDouble || onToggleUpper || (() => {});
  const handleToggleUpperSingle = onToggleUpperSingle || onToggleUpper || (() => {});
  const handleToggleLowerDouble = onToggleLowerDouble || onToggleLower || (() => {});
  const handleToggleLowerSingle = onToggleLowerSingle || onToggleLower || (() => {});

  // Separate shelves into 2-Door and 1-Door compartments
  const allUpper = (cabinet.shelves?.filter((s) => s.section === "Upper") || []).sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const allLower = (cabinet.shelves?.filter((s) => s.section === "Lower") || []).sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  let doubleUpper = allUpper.filter((s) => s.shelfCode.includes("2-Door"));
  let singleUpper = allUpper.filter((s) => s.shelfCode.includes("1-Door"));

  // Fallback if shelves don't have "(2-Door)" tags
  if (doubleUpper.length === 0 && singleUpper.length === 0) {
    doubleUpper = allUpper;
    singleUpper = allUpper.map((s, idx) => ({
      ...s,
      id: s.id + 500,
      shelfCode: `U${idx + 1} (1-Door)`,
      magazines: [],
      folders: [],
      standaloneFiles: []
    }));
  }

  let doubleLower = allLower.filter((s) => s.shelfCode.includes("2-Door"));
  let singleLower = allLower.filter((s) => s.shelfCode.includes("1-Door"));

  if (doubleLower.length === 0 && singleLower.length === 0) {
    doubleLower = allLower;
    singleLower = allLower.map((s, idx) => ({
      ...s,
      id: s.id + 500,
      shelfCode: `L${idx + 1} (1-Door)`,
      magazines: [],
      folders: [],
      standaloneFiles: []
    }));
  }

  // Helper to render a compartment's shelf stack
  const renderShelfStack = (
    shelves: Shelf[],
    compact: boolean,
    onToggle: () => void
  ) => (
    <div className="w-full h-full flex flex-col justify-between shelf-interior-texture py-1">
      {shelves.map((shelf) => (
        <ShelfRow
          key={`w2-shelf-${shelf.id}`}
          shelf={shelf}
          compact={compact}
          shelfLabel={shelf.shelfCode.replace(" (2-Door)", "").replace(" (1-Door)", "")}
          highlightedItem={highlightedItem}
          onOpenMagazine={onOpenMagazine}
          onInspectFolder={onInspectFolder}
          onInspectFile={onInspectFile}
          onMoveItem={onMoveItem}
          onDeleteItem={onDeleteItem}
          onDropOnShelf={onDropOnShelf}
          onDropInsideMagazine={onDropInsideMagazine}
          onReorderShelf={onReorderShelf}
          onToggleSection={onToggle}
        />
      ))}
    </div>
  );

  // Helper to render vertical divider partition wall
  const renderDivider = () => (
    <div className="w-2.5 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 border-x border-stone-400/40 shadow-inner flex-shrink-0 z-10" />
  );

  // Render Upper Double Module Doors
  const renderDoubleUpperDoors = () => (
    <div
      className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
        openUpperDouble ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
      }`}
      onClick={handleToggleUpperDouble}
    >
      <div
        className={`w-1/2 h-full cabinet-door-texture border-r border-stone-400/50 flex items-end justify-end pr-2 pb-10 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
          openUpperDouble ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
        }`}
      >
        <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
      </div>
      <div
        className={`w-1/2 h-full cabinet-door-texture border-r border-stone-400/60 flex items-end justify-start pl-2 pb-10 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
          openUpperDouble ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
        }`}
      >
        <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
      </div>
    </div>
  );

  // Render Upper Single Module Door
  const renderSingleUpperDoor = (isRightSide: boolean) => (
    <div
      className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
        openUpperSingle ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
      }`}
      onClick={handleToggleUpperSingle}
    >
      <div
        className={`w-full h-full cabinet-door-texture flex items-end pb-10 transition-transform duration-700 ease-in-out transform-style-3d ${
          isRightSide
            ? `justify-start pl-2 origin-right ${openUpperSingle ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"}`
            : `justify-end pr-2 origin-left border-r border-stone-400/60 ${openUpperSingle ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"}`
        }`}
      >
        <div className="w-3.5 h-20 metal-handle rounded-sm shadow-md" />
      </div>
    </div>
  );

  // Render Lower Double Module Doors
  const renderDoubleLowerDoors = () => (
    <div
      className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
        openLowerDouble ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
      }`}
      onClick={handleToggleLowerDouble}
    >
      <div
        className={`w-1/2 h-full cabinet-door-texture border-r border-stone-400/50 flex items-center justify-end pr-2 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${
          openLowerDouble ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
        }`}
      >
        <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
      </div>
      <div
        className={`w-1/2 h-full cabinet-door-texture border-r border-stone-400/60 flex items-center justify-start pl-2 origin-right transition-transform duration-700 ease-in-out transform-style-3d ${
          openLowerDouble ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"
        }`}
      >
        <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
      </div>
    </div>
  );

  // Render Lower Single Module Door
  const renderSingleLowerDoor = (isRightSide: boolean) => (
    <div
      className={`absolute inset-0 z-30 flex transition-opacity duration-300 ${
        openLowerSingle ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto cursor-pointer"
      }`}
      onClick={handleToggleLowerSingle}
    >
      <div
        className={`w-full h-full cabinet-door-texture flex items-center transition-transform duration-700 ease-in-out transform-style-3d ${
          isRightSide
            ? `justify-start pl-2 origin-right ${openLowerSingle ? "rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"}`
            : `justify-end pr-2 origin-left border-r border-stone-400/60 ${openLowerSingle ? "-rotate-y-90 scale-x-0" : "rotate-y-0 scale-x-100"}`
        }`}
      >
        <div className="w-3.5 h-16 metal-handle rounded-sm shadow-md" />
      </div>
    </div>
  );

  return (
    <div
      id={`cabinet-${cabinet.cabinetNumber}`}
      className="flex-shrink-0 w-[480px] sm:w-[540px] md:w-[600px] flex flex-col bg-stone-100 border border-stone-300/80 rounded-lg overflow-hidden shadow-lg relative transition-all duration-300"
    >
      {/* Cabinet Header Plaque */}
      <div className="cabinet-header-texture border-b border-[#b09a76]/40 px-4 py-2.5 flex items-center justify-center shadow-xs">
        <h3 className="text-sm font-semibold text-stone-800 tracking-wide text-center drop-shadow-sm">
          {cabinet.name}
        </h3>
      </div>

      {/* UPPER SECTION: Dual-Compartment Interior */}
      <div className="relative border-b-2 border-stone-300/60 bg-white perspective-1000 min-h-[512px] flex">
        {isLeftDouble ? (
          /* Cabinet 1: Left = 2-Door Module (2/3), Right = 1-Door Module (1/3) */
          <>
            {/* Left 2-Door Module */}
            <div className="relative w-2/3 h-full flex flex-col">
              {renderShelfStack(doubleUpper, false, handleToggleUpperDouble)}
              {renderDoubleUpperDoors()}
            </div>

            {/* Vertical Wood Divider Partition */}
            {renderDivider()}

            {/* Right 1-Door Module */}
            <div className="relative w-1/3 h-full flex flex-col">
              {renderShelfStack(singleUpper, true, handleToggleUpperSingle)}
              {renderSingleUpperDoor(true)}
            </div>
          </>
        ) : (
          /* Cabinet 2: Left = 1-Door Module (1/3), Right = 2-Door Module (2/3) */
          <>
            {/* Left 1-Door Module */}
            <div className="relative w-1/3 h-full flex flex-col">
              {renderShelfStack(singleUpper, true, handleToggleUpperSingle)}
              {renderSingleUpperDoor(false)}
            </div>

            {/* Vertical Wood Divider Partition */}
            {renderDivider()}

            {/* Right 2-Door Module */}
            <div className="relative w-2/3 h-full flex flex-col">
              {renderShelfStack(doubleUpper, false, handleToggleUpperDouble)}
              {renderDoubleUpperDoors()}
            </div>
          </>
        )}
      </div>

      {/* LOWER SECTION: Dual-Compartment Interior */}
      <div className="relative bg-white perspective-1000 min-h-[260px] flex">
        {isLeftDouble ? (
          /* Cabinet 1: Left = 2-Door Module (2/3), Right = 1-Door Module (1/3) */
          <>
            {/* Left 2-Door Module */}
            <div className="relative w-2/3 h-full flex flex-col">
              {renderShelfStack(doubleLower, false, handleToggleLowerDouble)}
              {renderDoubleLowerDoors()}
            </div>

            {/* Vertical Wood Divider Partition */}
            {renderDivider()}

            {/* Right 1-Door Module */}
            <div className="relative w-1/3 h-full flex flex-col">
              {renderShelfStack(singleLower, true, handleToggleLowerSingle)}
              {renderSingleLowerDoor(true)}
            </div>
          </>
        ) : (
          /* Cabinet 2: Left = 1-Door Module (1/3), Right = 2-Door Module (2/3) */
          <>
            {/* Left 1-Door Module */}
            <div className="relative w-1/3 h-full flex flex-col">
              {renderShelfStack(singleLower, true, handleToggleLowerSingle)}
              {renderSingleLowerDoor(false)}
            </div>

            {/* Vertical Wood Divider Partition */}
            {renderDivider()}

            {/* Right 2-Door Module */}
            <div className="relative w-2/3 h-full flex flex-col">
              {renderShelfStack(doubleLower, false, handleToggleLowerDouble)}
              {renderDoubleLowerDoors()}
            </div>
          </>
        )}
      </div>

      {/* Base Plank */}
      <div className="w-full h-4 bg-gradient-to-b from-[#b09a76] to-[#9a8566] border-t border-[#b09a76]/50" />
    </div>
  );
};
