"use client";

import React, { useState } from "react";
import { Shelf, Magazine, Folder, RecordFile } from "@/lib/types";
import { MagazineSpine } from "./MagazineSpine";
import { FolderSpine } from "./FolderSpine";
import { StandaloneFileSpine } from "./StandaloneFileSpine";

interface ShelfRowProps {
  shelf: Shelf;
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

type ShelfItem =
  | { type: "Magazine"; id: number; orderIndex: number; data: Magazine }
  | { type: "Folder"; id: number; orderIndex: number; data: Folder }
  | { type: "File"; id: number; orderIndex: number; data: RecordFile };

export const ShelfRow: React.FC<ShelfRowProps> = ({
  shelf,
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
  const [isDragOverShelf, setIsDragOverShelf] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // Combine magazines, folders, and standalone files into a unified sequence
  const allItems: ShelfItem[] = [
    ...(shelf.magazines || []).map((m) => ({
      type: "Magazine" as const,
      id: m.id,
      orderIndex: m.orderIndex,
      data: m
    })),
    ...(shelf.folders || []).map((f) => ({
      type: "Folder" as const,
      id: f.id,
      orderIndex: f.orderIndex,
      data: f
    })),
    ...(shelf.standaloneFiles || []).map((f) => ({
      type: "File" as const,
      id: f.id,
      orderIndex: f.orderIndex,
      data: f
    }))
  ];

  // Sort ascending by orderIndex, with tie-break on id
  allItems.sort((a, b) => {
    if (a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex;
    }
    return a.id - b.id;
  });

  const isShelfHighlighted =
    highlightedItem &&
    ((highlightedItem.type === "Shelf" && highlightedItem.id === shelf.id) ||
      shelf.magazines?.some((m) => highlightedItem.type === "Magazine" && m.id === highlightedItem.id) ||
      shelf.folders?.some((f) => highlightedItem.type === "Folder" && f.id === highlightedItem.id) ||
      shelf.standaloneFiles?.some((f) => highlightedItem.type === "File" && f.id === highlightedItem.id) ||
      shelf.magazines?.some((m) => m.files?.some((f) => highlightedItem.type === "File" && f.id === highlightedItem.id)));

  const handleShelfDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverShelf(true);
  };

  const handleShelfDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the shelf container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverShelf(false);
      setDragOverSlot(null);
    }
  };

  const handleShelfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverShelf(false);
    setDragOverSlot(null);
    onDropOnShelf(e, shelf.id);
  };

  const handleSlotDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverShelf(true);
    setDragOverSlot(slotIndex);
  };

  const handleSlotDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSlotDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverShelf(false);
    setDragOverSlot(null);

    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;

    try {
      const parsed = JSON.parse(rawData);

      // Check if the item is already on this shelf
      const fromIndex = allItems.findIndex((it) => it.type === parsed.type && it.id === parsed.id);

      if (fromIndex !== -1 && onReorderShelf) {
        // Rearranging within this shelf
        const updated = Array.from(allItems);
        const [movedItem] = updated.splice(fromIndex, 1);
        const adjustedTarget = fromIndex < slotIndex ? slotIndex - 1 : slotIndex;
        updated.splice(adjustedTarget, 0, movedItem);

        const reorderedPayload = updated.map((item, idx) => ({
          type: item.type,
          id: item.id,
          orderIndex: idx + 1
        }));

        onReorderShelf(shelf.id, reorderedPayload);
        return;
      }

      // If dragged from another shelf or pulled from a magazine box
      onDropOnShelf(e, shelf.id, slotIndex);
    } catch (err) {
      console.error("Slot drop parse error:", err);
      onDropOnShelf(e, shelf.id, slotIndex);
    }
  };

  // Helper to render the glowing vertical amber insertion slot
  const renderSlot = (slotIndex: number) => {
    const isHovered = dragOverSlot === slotIndex;

    return (
      <div
        key={`slot-${slotIndex}`}
        onDragOver={(e) => handleSlotDragOver(e, slotIndex)}
        onDragLeave={handleSlotDragLeave}
        onDrop={(e) => handleSlotDrop(e, slotIndex)}
        className={`relative h-28 flex items-center justify-center transition-all cursor-pointer z-30 ${
          isHovered
            ? "w-8 -mx-1"
            : isDragOverShelf
            ? "w-4 -mx-1 opacity-80"
            : "w-2 -mx-0.5 opacity-0 hover:opacity-100"
        }`}
      >
        {isHovered ? (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-150">
            {/* Glowing vertical amber laser bar */}
            <div className="w-1.5 h-26 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,1)] ring-2 ring-amber-300 scale-y-105" />
            <span className="absolute -top-3 px-1.5 py-0.5 bg-amber-500 text-slate-950 font-bold text-[9px] font-mono rounded shadow-md pointer-events-none whitespace-nowrap z-40">
              Insert Here
            </span>
          </div>
        ) : isDragOverShelf ? (
          <div className="w-0.5 h-20 border-r-2 border-dashed border-amber-400/80 rounded-full pointer-events-none" />
        ) : (
          <div className="w-0.5 h-16 bg-transparent pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <div
      onDragOver={handleShelfDragOver}
      onDragLeave={handleShelfDragLeave}
      onDrop={handleShelfDrop}
      className={`relative w-full h-32 flex flex-col justify-end px-3 transition-colors ${
        isDragOverShelf
          ? "bg-amber-100/90 ring-2 ring-dashed ring-amber-500"
          : isShelfHighlighted
          ? "bg-amber-100/70"
          : "bg-transparent"
      }`}
    >
      {/* Physical Shelf Label Badge */}
      <div className="absolute top-1 left-2.5 z-10 flex items-center gap-1.5">
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase shadow-xs border ${
            isDragOverShelf
              ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400"
              : isShelfHighlighted
              ? "bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400"
              : "bg-white/90 text-slate-700 border-slate-300"
          }`}
        >
          Shelf {shelf.shelfCode} {isDragOverShelf && "• Drag & Arrange"}
        </span>
      </div>
      <div className="relative w-full h-3.5 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 border-t border-slate-300 shadow-xs" />

      {/* Upright Interleaved Items Container Track */}
      <div className="flex items-end overflow-x-auto pb-1.5 pt-6 z-20 no-scrollbar">
        {allItems.length === 0 ? (
          <div className="w-full text-center text-[11px] text-slate-400 font-mono tracking-wide py-6 select-none italic">
            — Empty Shelf Track (Drag & Drop Items Here) —
          </div>
        ) : (
          <>
            {/* Slot 0: Insertion before first item */}
            {renderSlot(0)}

            {allItems.map((item, index) => {
              const isHighlighted =
                (highlightedItem?.type === item.type && highlightedItem.id === item.id) ||
                (item.type === "Magazine" &&
                  highlightedItem?.type === "File" &&
                  (item.data as Magazine).files?.some((f) => f.id === highlightedItem.id));

              return (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  {/* Item Container with left/right dragover target detection */}
                  <div
                    className="relative shrink-0 flex items-end"
                    onDragOver={(e) => {
                      // Detect if cursor is on left half or right half of the spine
                      const rect = e.currentTarget.getBoundingClientRect();
                      const midX = rect.left + rect.width / 2;
                      if (e.clientX < midX) {
                        setDragOverSlot(index);
                      } else {
                        setDragOverSlot(index + 1);
                      }
                    }}
                  >
                    {item.type === "Magazine" && (
                      <MagazineSpine
                        magazine={item.data as Magazine}
                        isHighlighted={isHighlighted}
                        onClick={() => onOpenMagazine(item.data as Magazine)}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              type: "Magazine",
                              id: item.id,
                              fromShelfId: shelf.id,
                              fromIndex: index
                            })
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDrop={(e) => {
                          // Allow dropping files inside the magazine
                          onDropInsideMagazine(e, item.id);
                        }}
                        onMove={(e) => {
                          e.stopPropagation();
                          onMoveItem("Magazine", item.id);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          const mag = item.data as Magazine;
                          onDeleteItem("Magazine", mag.id, mag.name, mag.files?.length || 0);
                        }}
                      />
                    )}

                    {item.type === "Folder" && (
                      <FolderSpine
                        folder={item.data as Folder}
                        isHighlighted={isHighlighted}
                        onClick={() => onInspectFolder(item.data as Folder)}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              type: "Folder",
                              id: item.id,
                              fromShelfId: shelf.id,
                              fromIndex: index
                            })
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onMove={(e) => {
                          e.stopPropagation();
                          onMoveItem("Folder", item.id);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          const fld = item.data as Folder;
                          onDeleteItem("Folder", fld.id, fld.name);
                        }}
                      />
                    )}

                    {item.type === "File" && (
                      <StandaloneFileSpine
                        file={item.data as RecordFile}
                        isHighlighted={isHighlighted}
                        onClick={() => onInspectFile(item.data as RecordFile)}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              type: "File",
                              id: item.id,
                              fromShelfId: shelf.id,
                              fromIndex: index
                            })
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onMove={(e) => {
                          e.stopPropagation();
                          onMoveItem("File", item.id);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          const f = item.data as RecordFile;
                          onDeleteItem("File", f.id, f.title);
                        }}
                      />
                    )}
                  </div>

                  {/* Drop Slot after this item */}
                  {renderSlot(index + 1)}
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>

      {/* Heavy Metallic Shelf Plank */}
      <div className="relative w-full h-3.5 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 border-t border-slate-300 shadow-xs flex items-center justify-between px-2">
        <div className="w-2 h-1 bg-slate-500/50 rounded-full" />
        <div className="flex-1 h-[1px] bg-white/60 mx-2" />
        <div className="w-2 h-1 bg-slate-500/50 rounded-full" />
      </div>
    </div>
  );
};
