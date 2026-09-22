"use client";

import React, { useState, useEffect } from "react";
import { HeaderSearch } from "@/components/HeaderSearch";
import { WallElevation } from "@/components/WallElevation";
import { SidebarDrawer } from "@/components/SidebarDrawer";
import { MagazineModal } from "@/components/MagazineModal";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { MoveItemModal } from "@/components/MoveItemModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { TrashModal } from "@/components/TrashModal";
import { Cabinet, FlatShelf, Magazine, Folder, RecordFile, DocumentType, SearchResult } from "@/lib/types";
import {
  fetchCabinets,
  fetchFlatShelves,
  fetchDocumentTypes,
  updateFile,
  updateFolder,
  deleteFile,
  deleteMagazine,
  deleteFolder,
  moveFile,
  moveMagazine,
  moveFolder,
  reorderShelfItems
} from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [flatShelves, setFlatShelves] = useState<FlatShelf[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Door states per cabinet
  const [openDoorsState, setOpenDoorsState] = useState<Record<number, { upper: boolean; lower: boolean }>>({
    1: { upper: true, lower: true },
    2: { upper: true, lower: true },
    3: { upper: true, lower: true },
    4: { upper: true, lower: true },
    5: { upper: true, lower: true },
    6: { upper: true, lower: true }
  });

  const [highlightedItem, setHighlightedItem] = useState<{ type: string; id: number } | null>(null);

  // Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [activeMagazine, setActiveMagazine] = useState<Magazine | null>(null);
  const [detailItem, setDetailItem] = useState<{ type: "File" | "Folder"; data: RecordFile | Folder } | null>(null);
  const [movingItem, setMovingItem] = useState<{ type: "Magazine" | "Folder" | "File"; id: number } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    type: "File" | "Magazine" | "Folder";
    id: number;
    name: string;
    fileCount?: number;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setErrorMsg(null);
    try {
      const [cabs, shelves, docTypes] = await Promise.all([
        fetchCabinets(),
        fetchFlatShelves(),
        fetchDocumentTypes()
      ]);
      setCabinets(cabs);
      setFlatShelves(shelves);
      setDocumentTypes(docTypes);
      setRefreshTrigger((prev) => prev + 1);

      if (activeMagazine) {
        const found = cabs.flatMap((c) => c.shelves).flatMap((s) => s.magazines).find((m) => m.id === activeMagazine.id);
        if (found) setActiveMagazine(found);
      }

      setDetailItem((prev) => {
        if (!prev) return null;
        if (prev.type === "File") {
          const allFiles = cabs
            .flatMap((c) => c.shelves || [])
            .flatMap((s) => [
              ...(s.standaloneFiles || []),
              ...(s.magazines || []).flatMap((m) => m.files || [])
            ]);
          const found = allFiles.find((f) => f.id === prev.data.id);
          return found ? { type: "File", data: found } : prev;
        } else if (prev.type === "Folder") {
          const allFolders = cabs
            .flatMap((c) => c.shelves || [])
            .flatMap((s) => s.folders || []);
          const found = allFolders.find((f) => f.id === prev.data.id);
          return found ? { type: "Folder", data: found } : prev;
        }
        return prev;
      });
    } catch (err: unknown) {
      console.error("Failed to load data:", err);
      setErrorMsg("Unable to connect to the .NET backend API at http://localhost:5000. Please make sure the backend is running (run `dotnet run` inside the backend directory).");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const allMagazines = cabinets.flatMap((c) => c.shelves || []).flatMap((s) => s.magazines || []);

  const handleSelectSearchResult = (result: SearchResult) => {
    setOpenDoorsState((prev) => ({
      ...prev,
      [result.cabinetNumber]: {
        ...prev[result.cabinetNumber],
        [result.section.toLowerCase()]: true
      }
    }));

    setHighlightedItem({ type: result.type, id: result.id });

    setTimeout(() => {
      const el = document.getElementById(`cabinet-${result.cabinetNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }, 150);

    if (result.type === "File" && result.magazineId) {
      const targetMag = allMagazines.find((m) => m.id === result.magazineId);
      if (targetMag) {
        setTimeout(() => {
          setActiveMagazine(targetMag);
        }, 500);
      }
    }

    setTimeout(() => {
      setHighlightedItem(null);
    }, 8000);
  };

  // Drag to Trash Handler
  const handleDropOnTrash = (type: "Magazine" | "Folder" | "File", id: number) => {
    let name = `${type} #${id}`;
    let fileCount: number | undefined = undefined;

    if (type === "File") {
      const file = cabinets
        .flatMap((c) => c.shelves || [])
        .flatMap((s) => [
          ...(s.standaloneFiles || []),
          ...(s.magazines || []).flatMap((m) => m.files || [])
        ])
        .find((f) => f.id === id);
      if (file) name = file.title;
    } else if (type === "Folder") {
      const folder = cabinets
        .flatMap((c) => c.shelves || [])
        .flatMap((s) => s.folders || [])
        .find((f) => f.id === id);
      if (folder) name = folder.name;
    } else if (type === "Magazine") {
      const mag = cabinets
        .flatMap((c) => c.shelves || [])
        .flatMap((s) => s.magazines || [])
        .find((m) => m.id === id);
      if (mag) {
        name = mag.name;
        fileCount = mag.files?.length || 0;
      }
    }

    handleDeletePrompt(type, id, name, fileCount);
  };

  // Drag & Drop Handlers
  const handleDropOnShelf = async (e: React.DragEvent, shelfId: number, targetIndex?: number) => {
    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;
    try {
      const parsed = JSON.parse(rawData);
      const targetOrderIndex = targetIndex !== undefined ? targetIndex + 1 : undefined;

      if (parsed.type === "File") {
        await moveFile(parsed.id, { targetShelfId: shelfId, orderIndex: targetOrderIndex });
      } else if (parsed.type === "Folder") {
        await moveFolder(parsed.id, { targetShelfId: shelfId, orderIndex: targetOrderIndex });
      } else if (parsed.type === "Magazine") {
        await moveMagazine(parsed.id, { targetShelfId: shelfId, orderIndex: targetOrderIndex });
      }
      await loadData();
    } catch (err) {
      console.error("Drop failed:", err);
    }
  };

  const handleDropInsideMagazine = async (e: React.DragEvent, magazineId: number) => {
    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.type === "File") {
        await moveFile(parsed.id, { targetMagazineId: magazineId });
        await loadData();
      } else {
        alert("Only files can be stored inside a magazine box.");
      }
    } catch (err) {
      console.error("Drop inside magazine failed:", err);
    }
  };

  // Reorder Items on a Shelf Handler (Optimistic UI Update + Backend Sync)
  const handleReorderShelf = async (
    shelfId: number,
    items: Array<{ type: "Magazine" | "Folder" | "File"; id: number; orderIndex: number }>
  ) => {
    // Optimistically update cabinets state so UI is immediate
    setCabinets((prev) =>
      prev.map((cab) => ({
        ...cab,
        shelves: (cab.shelves || []).map((s) => {
          if (s.id !== shelfId) return s;
          const orderMap = new Map<string, number>();
          items.forEach((it) => orderMap.set(`${it.type}-${it.id}`, it.orderIndex));
          return {
            ...s,
            magazines: (s.magazines || []).map((m) => ({
              ...m,
              orderIndex: orderMap.get(`Magazine-${m.id}`) ?? m.orderIndex
            })),
            folders: (s.folders || []).map((f) => ({
              ...f,
              orderIndex: orderMap.get(`Folder-${f.id}`) ?? f.orderIndex
            })),
            standaloneFiles: (s.standaloneFiles || []).map((sf) => ({
              ...sf,
              orderIndex: orderMap.get(`File-${sf.id}`) ?? sf.orderIndex
            }))
          };
        })
      }))
    );

    try {
      await reorderShelfItems(shelfId, items);
    } catch (err) {
      console.error("Failed to persist shelf order:", err);
      await loadData();
    }
  };

  // Pull out / Extract File from Magazine back to Shelf Track
  const handleExtractFile = async (fileId: number) => {
    try {
      // Find the file's current magazine to place it onto that magazine's shelf
      let targetShelfId: number | undefined = activeMagazine?.shelfId;
      if (!targetShelfId) {
        for (const cab of cabinets) {
          for (const s of cab.shelves || []) {
            const hasMag = s.magazines?.some((m) => m.files?.some((f) => f.id === fileId));
            if (hasMag) {
              targetShelfId = s.id;
              break;
            }
          }
          if (targetShelfId) break;
        }
      }

      await moveFile(fileId, { targetShelfId });
      await loadData();
    } catch (err) {
      console.error("Failed to extract file from magazine:", err);
      alert("Failed to pull out file: " + err);
    }
  };

  const handleMoveConfirm = async (target: { targetShelfId?: number; targetMagazineId?: number }) => {
    if (!movingItem) return;
    if (movingItem.type === "File") {
      await moveFile(movingItem.id, target);
    } else if (movingItem.type === "Magazine") {
      if (target.targetShelfId) {
        await moveMagazine(movingItem.id, { targetShelfId: target.targetShelfId });
      }
    } else if (movingItem.type === "Folder") {
      if (target.targetShelfId) {
        await moveFolder(movingItem.id, { targetShelfId: target.targetShelfId });
      }
    }
    await loadData();
  };

  const handleDeletePrompt = (
    type: "Magazine" | "Folder" | "File",
    id: number,
    name: string,
    fileCount?: number
  ) => {
    setDeletingItem({ type, id, name, fileCount });
  };

  const handleConfirmDelete = async (deleteContents: boolean = true) => {
    if (!deletingItem) return;
    if (deletingItem.type === "File") {
      await deleteFile(deletingItem.id);
    } else if (deletingItem.type === "Magazine") {
      await deleteMagazine(deletingItem.id, deleteContents);
      if (activeMagazine?.id === deletingItem.id) {
        setActiveMagazine(null);
      }
    } else if (deletingItem.type === "Folder") {
      await deleteFolder(deletingItem.id);
    }
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-stone-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700 mb-3" />
        <p className="text-stone-500 text-sm font-medium tracking-wide">Loading CabinetMap...</p>
      </div>
    );
  }

  const areAllDoorsOpen = Object.values(openDoorsState).every((d) => d.upper && d.lower);

  const handleToggleAllDoors = () => {
    const shouldOpen = !areAllDoorsOpen;
    const newState: Record<number, { upper: boolean; lower: boolean }> = {};
    for (let i = 1; i <= 6; i++) {
      newState[i] = { upper: shouldOpen, lower: shouldOpen };
    }
    setOpenDoorsState(newState);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-stone-900">
      {/* Top Universal Search Bar */}
      <HeaderSearch
        onSelectResult={handleSelectSearchResult}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenTrash={() => setIsTrashOpen(true)}
        onDropTrash={handleDropOnTrash}
        refreshTrigger={refreshTrigger}
        allDoorsOpen={areAllDoorsOpen}
        onToggleAllDoors={handleToggleAllDoors}
      />

      {/* Backend Disconnection Banner */}
      {errorMsg && (
        <div className="bg-amber-50 border-b border-amber-300 px-6 py-3 flex items-center justify-between text-amber-900 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Backend Server Not Connected:</span>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Interactive Wall Elevation with Drag & Drop */}
      <WallElevation
        cabinets={cabinets}
        openDoorsState={openDoorsState}
        setOpenDoorsState={setOpenDoorsState}
        highlightedItem={highlightedItem}
        onOpenMagazine={(mag) => setActiveMagazine(mag)}
        onInspectFolder={(fld) => setDetailItem({ type: "Folder", data: fld })}
        onInspectFile={(file) => setDetailItem({ type: "File", data: file })}
        onMoveItem={(type, id) => setMovingItem({ type, id })}
        onDeleteItem={handleDeletePrompt}
        onDropOnShelf={handleDropOnShelf}
        onDropInsideMagazine={handleDropInsideMagazine}
        onReorderShelf={handleReorderShelf}
      />

      {/* Left Management Sidebar Drawer */}
      {/* Slide-out Sidebar Drawer for Creating New Records */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        shelves={flatShelves}
        magazines={allMagazines}
        documentTypes={documentTypes}
        onRefreshData={loadData}
      />

      {/* Magazine Content Pop-out Modal */}
      {/* Pop-out Magazine Drawer */}
      {/* Magazine Content Pop-out Modal with Extraction & Reordering */}
      <MagazineModal
        magazine={activeMagazine}
        onClose={() => setActiveMagazine(null)}
        onInspectFile={(file) => setDetailItem({ type: "File", data: file })}
        onAddNewFile={() => {
          setActiveMagazine(null);
          setIsSidebarOpen(true);
        }}
        onMoveFile={(fileId) => setMovingItem({ type: "File", id: fileId })}
        onExtractFile={handleExtractFile}
        onDeleteFile={(fileId) => {
          const file = activeMagazine?.files?.find((f) => f.id === fileId);
          handleDeletePrompt("File", fileId, file?.title || `File #${fileId}`);
        }}
        onDeleteMagazine={(magazineId, name, fileCount) => {
          handleDeletePrompt("Magazine", magazineId, name, fileCount);
        }}
      />

      {/* File or Folder Detail & Digital Twin Inspector Modal */}
      {/* Digital Twin Metadata & Scan Viewer / Editor Modal */}
      <ItemDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onExtractFile={handleExtractFile}
        onDeleteItem={(type, id, name) => {
          handleDeletePrompt(type, id, name);
        }}
        onSaveFile={async (file) => {
          const updated = await updateFile(file.id, {
            code: file.code,
            title: file.title,
            documentTypeId: file.documentTypeId,
            metadataJson: file.metadataJson,
            magazineId: file.magazineId,
            shelfId: file.shelfId,
            attachmentUrl: file.attachmentUrl,
            attachmentName: file.attachmentName,
            attachmentsJson: file.attachmentsJson
          });
          setDetailItem({ type: "File", data: updated });
          await loadData();
        }}
        onSaveFolder={async (folder) => {
          const updated = await updateFolder(folder.id, {
            name: folder.name,
            code: folder.code,
            colorHex: folder.colorHex,
            shelfId: folder.shelfId,
            attachmentUrl: folder.attachmentUrl,
            attachmentName: folder.attachmentName,
            attachmentsJson: folder.attachmentsJson
          });
          setDetailItem({ type: "Folder", data: updated });
          await loadData();
        }}
      />

      {/* Reposition / Move Modal */}
      <MoveItemModal
        item={movingItem}
        shelves={flatShelves}
        magazines={allMagazines}
        onClose={() => setMovingItem(null)}
        onConfirmMove={handleMoveConfirm}
      />

      {/* Delete Confirmation Popup */}
      <DeleteConfirmModal
        isOpen={deletingItem !== null}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Recycle Bin / Trash Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        onItemRestored={loadData}
      />
    </main>
  );
}
