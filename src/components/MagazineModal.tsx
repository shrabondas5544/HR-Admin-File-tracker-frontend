"use client";

import React from "react";
import { Box, FileText, X, Plus, MoveRight, Trash2, Paperclip, ExternalLink, FolderOutput } from "lucide-react";
import { Magazine, RecordFile } from "@/lib/types";

interface MagazineModalProps {
  magazine: Magazine | null;
  onClose: () => void;
  onInspectFile: (file: RecordFile) => void;
  onAddNewFile: (magazineId: number) => void;
  onMoveFile: (fileId: number) => void;
  onDeleteFile: (fileId: number) => void;
  onExtractFile?: (fileId: number) => void;
  onDeleteMagazine?: (magazineId: number, name: string, fileCount: number) => void;
}

export const MagazineModal: React.FC<MagazineModalProps> = ({
  magazine,
  onClose,
  onInspectFile,
  onAddNewFile,
  onMoveFile,
  onDeleteFile,
  onExtractFile,
  onDeleteMagazine
}) => {
  if (!magazine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Top Header */}
        <div
          className="p-5 flex items-center justify-between border-b border-slate-200"
          style={{ backgroundColor: `${magazine.colorHex}15` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: magazine.colorHex || "#2563eb" }}
            >
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">{magazine.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                  {magazine.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Magazine Holder Container • {magazine.files?.length || 0} Files Enclosed • Drag files out to shelves
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Header */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Dossiers & Files Inside
          </span>
          <button
            onClick={() => onAddNewFile(magazine.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add File Inside Box
          </button>
        </div>

        {/* Files List View */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-2">
          {(!magazine.files || magazine.files.length === 0) ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              This magazine box is currently empty. Click &quot;Add File Inside Box&quot; to file records here.
            </div>
          ) : (
            magazine.files.map((file) => {
              let parsedMeta: Record<string, string> = {};
              try {
                parsedMeta = JSON.parse(file.metadataJson);
              } catch {}

              return (
                <div
                  key={`mag-file-${file.id}`}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ type: "File", id: file.id, fromMagazineId: magazine.id })
                    );
                  }}
                  className="pt-2.5 pb-2.5 flex items-center justify-between group hover:bg-slate-50 p-2.5 rounded-xl transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-slate-200"
                >
                  <div
                    onClick={() => onInspectFile(file)}
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                          {file.title}
                        </span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {file.code}
                        </span>
                        {file.attachmentUrl && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                            <Paperclip className="w-3 h-3 text-amber-600" />
                            Twin Attached
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        {parsedMeta.employeeName && (
                          <span className="text-slate-900 font-medium">{parsedMeta.employeeName}</span>
                        )}
                        {parsedMeta.employeeNo && (
                          <span className="font-mono text-slate-500">ID: {parsedMeta.employeeNo}</span>
                        )}
                        {parsedMeta.designation && (
                          <span>• {parsedMeta.designation}</span>
                        )}
                        {parsedMeta.department && (
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700 border border-slate-200">
                            {parsedMeta.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    {onExtractFile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExtractFile(file.id);
                        }}
                        title="Pull Out / Extract File to Shelf Track"
                        className="flex items-center gap-1 px-2 py-1 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-semibold border border-amber-200 transition-colors cursor-pointer"
                      >
                        <FolderOutput className="w-3.5 h-3.5" />
                        <span>Pull Out</span>
                      </button>
                    )}
                    <button
                      onClick={() => onInspectFile(file)}
                      title="Inspect / Edit Digital Twin"
                      className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onMoveFile(file.id)}
                      title="Move to another Magazine or Shelf"
                      className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoveRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      title="Delete Record"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {onDeleteMagazine ? (
            <button
              onClick={() => onDeleteMagazine(magazine.id, magazine.name, magazine.files?.length || 0)}
              className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Magazine Box
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
