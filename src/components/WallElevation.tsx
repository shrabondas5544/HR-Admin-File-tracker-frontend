"use client";

import React, { useRef } from "react";
import { Cabinet, Magazine, Folder, RecordFile } from "@/lib/types";
import { CabinetUnit } from "./CabinetUnit";
import { Layers } from "lucide-react";

interface WallElevationProps {
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

export const WallElevation: React.FC<WallElevationProps> = ({
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Interactive Elevation Canvas */}
      <div
        ref={wallScrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto p-6 flex items-start gap-5 bg-white scroll-smooth"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        {cabinets.length === 0 ? (
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
          cabinets.map((cab) => {
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
