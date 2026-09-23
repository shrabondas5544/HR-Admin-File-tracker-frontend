"use client";

import React, { useRef } from "react";
import { Cabinet, Magazine, Folder, RecordFile, WallId } from "@/lib/types";
import { CabinetUnit } from "./CabinetUnit";
import { W2CabinetUnit } from "./W2CabinetUnit";
import { Layers } from "lucide-react";

interface WallElevationProps {
  selectedWall?: WallId;
  cabinets: Cabinet[];
  openDoorsState: Record<number, { upper: boolean; lower: boolean }>;
  setOpenDoorsState: React.Dispatch<React.SetStateAction<Record<number, { upper: boolean; lower: boolean }>>>;
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

const WALL_INFO: Record<WallId, { name: string; subtitle: string }> = {
  W1: { name: "Wall 1", subtitle: "Active Cabinet Archive" },
  W2: { name: "Wall 2", subtitle: "3-Door Modular Archive Units" },
  W3R: { name: "Wall 3 Right", subtitle: "Archive Room" },
  W3L: { name: "Wall 3 Left", subtitle: "Archive Room" },
};

const DEFAULT_W2_CABINETS: Cabinet[] = [
  {
    id: 7,
    cabinetNumber: 7,
    name: "Cabinet 1",
    description: "Wall 2 - 3-Door Unit 1",
    shelves: [
      { id: 701, cabinetId: 7, section: "Upper", shelfCode: "U1", orderIndex: 1, magazines: [], folders: [], standaloneFiles: [] },
      { id: 702, cabinetId: 7, section: "Upper", shelfCode: "U2", orderIndex: 2, magazines: [], folders: [], standaloneFiles: [] },
      { id: 703, cabinetId: 7, section: "Upper", shelfCode: "U3", orderIndex: 3, magazines: [], folders: [], standaloneFiles: [] },
      { id: 704, cabinetId: 7, section: "Upper", shelfCode: "U4", orderIndex: 4, magazines: [], folders: [], standaloneFiles: [] },
      { id: 705, cabinetId: 7, section: "Lower", shelfCode: "L1", orderIndex: 1, magazines: [], folders: [], standaloneFiles: [] },
      { id: 706, cabinetId: 7, section: "Lower", shelfCode: "L2", orderIndex: 2, magazines: [], folders: [], standaloneFiles: [] },
    ]
  },
  {
    id: 8,
    cabinetNumber: 8,
    name: "Cabinet 2",
    description: "Wall 2 - 3-Door Unit 2",
    shelves: [
      { id: 801, cabinetId: 8, section: "Upper", shelfCode: "U1", orderIndex: 1, magazines: [], folders: [], standaloneFiles: [] },
      { id: 802, cabinetId: 8, section: "Upper", shelfCode: "U2", orderIndex: 2, magazines: [], folders: [], standaloneFiles: [] },
      { id: 803, cabinetId: 8, section: "Upper", shelfCode: "U3", orderIndex: 3, magazines: [], folders: [], standaloneFiles: [] },
      { id: 804, cabinetId: 8, section: "Upper", shelfCode: "U4", orderIndex: 4, magazines: [], folders: [], standaloneFiles: [] },
      { id: 805, cabinetId: 8, section: "Lower", shelfCode: "L1", orderIndex: 1, magazines: [], folders: [], standaloneFiles: [] },
      { id: 806, cabinetId: 8, section: "Lower", shelfCode: "L2", orderIndex: 2, magazines: [], folders: [], standaloneFiles: [] },
    ]
  }
];

export const WallElevation: React.FC<WallElevationProps> = ({
  selectedWall = "W1",
  cabinets,
  openDoorsState,
  setOpenDoorsState,
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
  const wallScrollRef = useRef<HTMLDivElement>(null);

  // Wall 2 Custom 3-Door Cabinets Layout
  if (selectedWall === "W2") {
    const cab1 = cabinets.find((c) => c.cabinetNumber === 7) || DEFAULT_W2_CABINETS[0];
    const cab2 = cabinets.find((c) => c.cabinetNumber === 8) || DEFAULT_W2_CABINETS[1];

    const doorState1 = openDoorsState[7] || { upper: true, lower: true };
    const doorState2 = openDoorsState[8] || { upper: true, lower: true };

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Top Wall Indicator */}
        <div className="w-full flex items-center justify-between border-b border-stone-200 px-6 py-2.5 bg-stone-50/60 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Wall 2 (W2)
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500">
              3-Door Modular Archive Units (Double & Single Leaves)
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-600 font-semibold px-2 py-0.5 rounded bg-white border border-stone-200 shadow-2xs">
            2 Units • 6 Shelves Each
          </span>
        </div>

        {/* Wall 2 Elevation Canvas */}
        <div
          ref={wallScrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto p-6 flex items-start gap-8 bg-white scroll-smooth"
          style={{ minHeight: "calc(100vh - 100px)" }}
        >
          {/* Cabinet 1 (W2): Double door Left + Single door Right */}
          <W2CabinetUnit
            key="w2-cab-7"
            cabinet={{
              ...cab1,
              name: cab1.name.includes("W2") ? cab1.name : "Cabinet 1"
            }}
            variant="3door-left-double"
            isUpperOpen={doorState1.upper}
            isLowerOpen={doorState1.lower}
            onToggleUpper={() =>
              setOpenDoorsState((prev) => ({
                ...prev,
                7: {
                  ...doorState1,
                  upper: !doorState1.upper
                }
              }))
            }
            onToggleLower={() =>
              setOpenDoorsState((prev) => ({
                ...prev,
                7: {
                  ...doorState1,
                  lower: !doorState1.lower
                }
              }))
            }
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

          {/* Cabinet 2 (W2): Single door Left + Double door Right */}
          <W2CabinetUnit
            key="w2-cab-8"
            cabinet={{
              ...cab2,
              name: cab2.name.includes("W2") ? cab2.name : "Cabinet 2"
            }}
            variant="3door-right-double"
            isUpperOpen={doorState2.upper}
            isLowerOpen={doorState2.lower}
            onToggleUpper={() =>
              setOpenDoorsState((prev) => ({
                ...prev,
                8: {
                  ...doorState2,
                  upper: !doorState2.upper
                }
              }))
            }
            onToggleLower={() =>
              setOpenDoorsState((prev) => ({
                ...prev,
                8: {
                  ...doorState2,
                  lower: !doorState2.lower
                }
              }))
            }
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
        </div>
      </div>
    );
  }

  // Other Walls Placeholder (W3R, W3L)
  if (selectedWall && selectedWall !== "W1") {
    const info = WALL_INFO[selectedWall] || { name: selectedWall, subtitle: "Archive Room" };

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <div
          ref={wallScrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto p-8 flex flex-col justify-between items-center bg-white"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          {/* Top Wall Indicator */}
          <div className="w-full flex items-center justify-between border-b border-stone-200 pb-3 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">{info.name} ({selectedWall})</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-400">{info.subtitle}</span>
            </div>
            <span className="text-[11px] font-mono text-stone-400">Empty Wall Canvas</span>
          </div>

          {/* Center Empty Wall Content */}
          <div className="flex flex-col items-center justify-center text-center max-w-md py-20 select-none">
            <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 mb-4 shadow-2xs">
              <Layers className="w-8 h-8 text-stone-400 stroke-1" />
            </div>
            <h2 className="text-lg font-bold text-stone-800 mb-1">{info.name} is Empty</h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              No cabinets are installed on this wall yet. Active archive cabinets are located on <strong className="text-stone-700 font-semibold">Wall 1 (W1)</strong> and <strong className="text-stone-700 font-semibold">Wall 2 (W2)</strong>.
            </p>
          </div>

          {/* Architectural Wall Baseboard */}
          <div className="w-full flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] font-mono text-stone-400 select-none">
            <span>Room Elevation • {info.name}</span>
            <span>Wall Canvas Clean</span>
          </div>
        </div>
      </div>
    );
  }

  // Wall 1: Cabinets 1 through 6
  const wall1Cabinets = cabinets.filter((c) => c.cabinetNumber <= 6);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Interactive Elevation Canvas */}
      <div
        ref={wallScrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto p-6 flex items-start gap-5 bg-white scroll-smooth"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        {wall1Cabinets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-stone-50 rounded-2xl text-stone-500 mb-4 border border-stone-200">
              <Layers className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-1">No Cabinet Data Received</h3>
            <p className="text-stone-500 text-sm max-w-md mb-4">
              The frontend is ready, but it needs the .NET backend API running on <code className="bg-stone-50 px-1.5 py-0.5 rounded text-xs font-mono text-stone-700 border border-stone-200">http://localhost:5000</code> to load the cabinets and archive records.
            </p>
            <p className="text-xs text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-lg font-mono">
              In a separate terminal, run: <span className="text-amber-700 font-bold">cd backend && dotnet run</span>
            </p>
          </div>
        ) : (
          wall1Cabinets.map((cab) => {
            const doorState = openDoorsState[cab.cabinetNumber] || { upper: true, lower: true };

            return (
              <CabinetUnit
                key={`cab-${cab.id}`}
                cabinet={cab}
                isUpperOpen={doorState.upper}
                isLowerOpen={doorState.lower}
                onToggleUpper={() =>
                  setOpenDoorsState((prev) => ({
                    ...prev,
                    [cab.cabinetNumber]: {
                      ...doorState,
                      upper: !doorState.upper
                    }
                  }))
                }
                onToggleLower={() =>
                  setOpenDoorsState((prev) => ({
                    ...prev,
                    [cab.cabinetNumber]: {
                      ...doorState,
                      lower: !doorState.lower
                    }
                  }))
                }
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
            );
          })
        )}
      </div>
    </div>
  );
};
