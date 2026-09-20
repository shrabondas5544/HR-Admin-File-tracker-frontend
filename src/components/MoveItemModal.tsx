"use client";

import React, { useState } from "react";
import { FlatShelf, Magazine } from "@/lib/types";
import { X, MoveRight, Layers, Box } from "lucide-react";

interface MoveItemModalProps {
  item: { type: "Magazine" | "Folder" | "File"; id: number } | null;
  shelves: FlatShelf[];
  magazines: Magazine[];
  onClose: () => void;
  onConfirmMove: (target: { targetShelfId?: number; targetMagazineId?: number }) => Promise<void>;
}

export const MoveItemModal: React.FC<MoveItemModalProps> = ({
  item,
  shelves,
  magazines,
  onClose,
  onConfirmMove
}) => {
  if (!item) return null;

  const [destinationType, setDestinationType] = useState<"shelf" | "magazine">("shelf");
  const [selectedShelfId, setSelectedShelfId] = useState<number>(shelves[0]?.id || 1);
  const [selectedMagazineId, setSelectedMagazineId] = useState<number>(magazines[0]?.id || 1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (item.type === "File" && destinationType === "magazine") {
        await onConfirmMove({ targetMagazineId: selectedMagazineId });
      } else {
        await onConfirmMove({ targetShelfId: selectedShelfId });
      }
      onClose();
    } catch (err) {
      alert("Failed to move item: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoveRight className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Reposition {item.type} on Wall 1
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {item.type === "File" && (
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Destination Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDestinationType("shelf")}
                  className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    destinationType === "shelf"
                      ? "bg-amber-100 text-amber-900 border-amber-400"
                      : "bg-slate-50 text-slate-600 border-slate-300"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Direct on Shelf
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationType("magazine")}
                  className={`py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    destinationType === "magazine"
                      ? "bg-amber-100 text-amber-900 border-amber-400"
                      : "bg-slate-50 text-slate-600 border-slate-300"
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  Inside Magazine
                </button>
              </div>
            </div>
          )}

          {destinationType === "shelf" || item.type !== "File" ? (
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Select Destination Shelf (Cabinets 1–6)
              </label>
              <select
                value={selectedShelfId}
                onChange={(e) => setSelectedShelfId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {shelves.map((s) => (
                  <option key={`shelf-opt-${s.id}`} value={s.id}>
                    {s.displayName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Select Destination Magazine
              </label>
              <select
                value={selectedMagazineId}
                onChange={(e) => setSelectedMagazineId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {magazines.map((m) => (
                  <option key={`mag-opt-${m.id}`} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? "Moving..." : "Confirm Move"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
