"use client";

import React, { useState, useEffect } from "react";
import { FileAttachment } from "@/lib/types";
import { getFileUrl } from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  FileText,
  CheckCircle2,
  BookOpen,
  Layers,
  RotateCw
} from "lucide-react";

interface BookFlipViewerProps {
  attachments: FileAttachment[];
  onUploadPages?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePage?: (index: number) => void;
  uploading?: boolean;
  saveStatus?: string;
  title?: string;
  code?: string;
  colorHex?: string;
  itemType?: "File" | "Folder";
  metaFields?: Record<string, any>;
  checklistSummary?: { yes: number; no: number; none: number };
}

export const BookFlipViewer: React.FC<BookFlipViewerProps> = ({
  attachments,
  onUploadPages,
  onDeletePage,
  uploading = false,
  saveStatus = "",
  title = "Document Record",
  code = "REC-001",
  colorHex = "#51C4EC",
  itemType = "File",
  checklistSummary
}) => {
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [zoomPage, setZoomPage] = useState<{ url: string; name: string; pageNum: number } | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [zoomRotation, setZoomRotation] = useState<number>(0);

  useEffect(() => {
    if (attachments.length === 0) {
      setActiveTurnIndex(0);
    } else if (activeTurnIndex > attachments.length) {
      setActiveTurnIndex(Math.max(0, attachments.length - 1));
    }
  }, [attachments.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomPage) return;
      if (e.key === "ArrowRight") {
        handleNextFlip();
      } else if (e.key === "ArrowLeft") {
        handlePrevFlip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTurnIndex, attachments.length, isFlipping, zoomPage]);

  const handleNextFlip = () => {
    if (isFlipping) return;
    if (activeTurnIndex >= attachments.length) return;

    setIsFlipping(true);
    setTimeout(() => {
      setActiveTurnIndex((prev) => Math.min(attachments.length, prev + 1));
      setIsFlipping(false);
    }, 350);
  };

  const handlePrevFlip = () => {
    if (isFlipping) return;
    if (activeTurnIndex <= 0) return;

    setIsFlipping(true);
    setTimeout(() => {
      setActiveTurnIndex((prev) => Math.max(0, prev - 1));
      setIsFlipping(false);
    }, 350);
  };

  const handleJumpToPage = (targetIdx: number) => {
    if (isFlipping) return;
    if (targetIdx === activeTurnIndex) return;

    setIsFlipping(true);
    setTimeout(() => {
      setActiveTurnIndex(targetIdx);
      setIsFlipping(false);
    }, 250);
  };

  const leftPageIndex = activeTurnIndex > 0 ? activeTurnIndex - 1 : null;
  const rightPageIndex = activeTurnIndex < attachments.length ? activeTurnIndex : null;

  const leftPageAttachment = leftPageIndex !== null ? attachments[leftPageIndex] : null;
  const rightPageAttachment = rightPageIndex !== null ? attachments[rightPageIndex] : null;

  const totalPages = attachments.length;

  return (
    <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/90 shadow-inner flex flex-col gap-3 select-none">
      {/* Top Header / Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Flipbook View
          </span>
          {totalPages > 0 && (
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              {totalPages} {totalPages === 1 ? "Page" : "Pages"}
            </span>
          )}
          {saveStatus && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 ml-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}
        </div>

        {/* Action Controls & Upload Button */}
        <div className="flex items-center gap-2">
          {totalPages > 0 && (
            <div className="flex items-center bg-white rounded-lg border border-stone-200 px-2.5 py-1 shadow-2xs text-xs font-mono text-stone-700">
              <span className="font-bold text-stone-900">
                {rightPageIndex !== null ? `Page ${rightPageIndex + 1}` : "End"}
              </span>
              <span className="text-stone-400 mx-1">/</span>
              <span>{totalPages}</span>
            </div>
          )}

          {onUploadPages && (
            <label className="cursor-pointer text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5 transition-colors shadow-2xs">
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Picture(s)</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={onUploadPages}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {uploading && (
        <div className="py-3 text-center text-xs font-semibold text-amber-800 bg-amber-50 rounded-xl border border-amber-200 animate-pulse">
          Uploading digital scan leaf... Please wait.
        </div>
      )}

      {/* Main 3D Folder / Flipbook Stage */}
      <div className="relative w-full overflow-hidden flex flex-col items-center">
        {/* Navigation Floating Arrows */}
        <button
          onClick={handlePrevFlip}
          disabled={activeTurnIndex <= 0 || isFlipping}
          title="Flip to Previous Page (Left Arrow)"
          className={`absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/95 text-stone-700 shadow-md border border-stone-300 hover:bg-stone-50 hover:text-stone-950 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all ${
            activeTurnIndex > 0 ? "scale-100 hover:scale-110 ring-2 ring-amber-400/40" : ""
          }`}
        >
          <ChevronLeft className="w-5 h-5 stroke-2" />
        </button>

        <button
          onClick={handleNextFlip}
          disabled={activeTurnIndex >= totalPages || isFlipping}
          title="Flip to Next Page (Right Arrow)"
          className={`absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/95 text-stone-700 shadow-md border border-stone-300 hover:bg-stone-50 hover:text-stone-950 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all ${
            activeTurnIndex < totalPages ? "scale-100 hover:scale-110 ring-2 ring-amber-400/40" : ""
          }`}
        >
          <ChevronRight className="w-5 h-5 stroke-2" />
        </button>

        {/* 3D Open Folder Container */}
        <div
          className="w-full max-w-4xl py-2 px-2 md:px-6"
          style={{ perspective: "1800px" }}
        >
          <div
            className="relative w-full rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-stretch justify-center gap-0 border border-stone-300/80 shadow-2xl transition-all duration-300"
            style={{
              backgroundColor: "#f5f3ef",
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(235,230,220,0.5) 100%)",
              boxShadow:
                "0 20px 40px -15px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.08)"
            }}
          >
            {/* Center Vertical Spine Fold / Crease Shadow */}
            <div
              className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 30%, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.08) 100%)"
              }}
            />

            {/* ---------------- LEFT PANEL ---------------- */}
            <div className="flex-1 min-h-[360px] md:min-h-[440px] flex flex-col justify-between relative rounded-l-xl p-3 md:p-4 bg-white/60 border-r border-stone-300/60 shadow-inner overflow-hidden">
              {leftPageAttachment ? (
                /* Scanned Document Page on the Left Leaf */
                <div className="flex-1 flex flex-col justify-between relative group">
                  {/* Page Top Header Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-stone-600 font-mono">
                    <span className="font-bold px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800">
                      Page {leftPageIndex! + 1}
                    </span>
                    <span className="truncate max-w-[140px] text-[11px] text-stone-500">
                      {leftPageAttachment.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setZoomPage({
                            url: leftPageAttachment.url,
                            name: leftPageAttachment.name,
                            pageNum: leftPageIndex! + 1
                          })
                        }
                        title="Enlarge Scan"
                        className="p-1 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeletePage && (
                        <button
                          onClick={() => onDeletePage(leftPageIndex!)}
                          title="Delete Page"
                          className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Document Leaf Canvas */}
                  <div
                    onClick={handlePrevFlip}
                    title="Click left page to flip backward"
                    className="flex-1 flex items-center justify-center py-2 cursor-pointer relative"
                  >
                    {leftPageAttachment.url.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                      <img
                        src={getFileUrl(leftPageAttachment.url)}
                        alt={`Page ${leftPageIndex! + 1}`}
                        className="max-h-[310px] md:max-h-[350px] w-auto object-contain rounded shadow-md border border-stone-200/90 transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-stone-200 shadow-sm text-center">
                        <FileText className="w-12 h-12 text-amber-600 mb-2" />
                        <span className="text-xs font-mono font-bold text-stone-800 truncate max-w-[200px]">
                          {leftPageAttachment.name}
                        </span>
                        <a
                          href={getFileUrl(leftPageAttachment.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Open Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Inside Front Folder Pocket */
                <div className="flex-1 flex flex-col justify-between select-none">
                  {/* Upper Folder Information Header */}
                  <div className="p-3 bg-white/80 rounded-xl border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span className="font-mono font-bold text-xs text-stone-800 tracking-wide">
                        {code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold border border-stone-200">
                        {itemType}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 line-clamp-2 leading-snug mb-1">
                      {title}
                    </h4>

                    {checklistSummary && (
                      <div className="mt-2.5 pt-2 border-t border-stone-200/70 flex items-center gap-2 text-[10px] font-mono font-semibold">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ {checklistSummary.yes} Completed
                        </span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                          ✗ {checklistSummary.no} Pending
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clean Visual Folder Pocket Accent at the Bottom */}
                  <div
                    className="relative w-full rounded-xl p-3 mt-4 border border-stone-300/80 flex items-center justify-end overflow-hidden"
                    style={{
                      height: "100px",
                      backgroundColor: "#ebe6dc",
                      backgroundImage:
                        "linear-gradient(to bottom, #f2ece1 0%, #e5ded2 100%)",
                      boxShadow:
                        "0 -4px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-stone-400/20 shadow-inner" />

                    {onUploadPages && (
                      <label className="cursor-pointer text-[11px] font-bold text-stone-800 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-300 shadow-2xs flex items-center gap-1 transition-all">
                        <Plus className="w-3 h-3" />
                        <span>Insert Scan</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          onChange={onUploadPages}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Clean Bottom pocket lip */}
              <div
                className="w-full h-4 -mb-4 -mx-4 rounded-bl-xl border-t border-stone-300/60"
                style={{
                  backgroundColor: "#e2dad0",
                  boxShadow: "0 -2px 6px rgba(0,0,0,0.05)"
                }}
              />
            </div>

            {/* ---------------- RIGHT PANEL ---------------- */}
            <div className="flex-1 min-h-[360px] md:min-h-[440px] flex flex-col justify-between relative rounded-r-xl p-3 md:p-4 bg-white/60 shadow-inner overflow-hidden">
              {rightPageAttachment ? (
                /* Scanned Document Page on the Right Leaf */
                <div className="flex-1 flex flex-col justify-between relative group">
                  {/* Page Top Header Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-stone-600 font-mono">
                    <span className="font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-950">
                      Page {rightPageIndex! + 1}
                    </span>
                    <span className="truncate max-w-[140px] text-[11px] text-stone-500">
                      {rightPageAttachment.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setZoomPage({
                            url: rightPageAttachment.url,
                            name: rightPageAttachment.name,
                            pageNum: rightPageIndex! + 1
                          })
                        }
                        title="Enlarge Scan"
                        className="p-1 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeletePage && (
                        <button
                          onClick={() => onDeletePage(rightPageIndex!)}
                          title="Delete Page"
                          className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Document Leaf Canvas */}
                  <div
                    onClick={handleNextFlip}
                    title="Click right page to flip forward"
                    className="flex-1 flex items-center justify-center py-2 cursor-pointer relative"
                  >
                    {rightPageAttachment.url.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                      <img
                        src={getFileUrl(rightPageAttachment.url)}
                        alt={`Page ${rightPageIndex! + 1}`}
                        className="max-h-[310px] md:max-h-[350px] w-auto object-contain rounded shadow-md border border-stone-200/90 transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-stone-200 shadow-sm text-center">
                        <FileText className="w-12 h-12 text-amber-600 mb-2" />
                        <span className="text-xs font-mono font-bold text-stone-800 truncate max-w-[200px]">
                          {rightPageAttachment.name}
                        </span>
                        <a
                          href={getFileUrl(rightPageAttachment.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Open Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Inside Back Cover / Empty End Pocket */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-3 shadow-2xs">
                    <Layers className="w-7 h-7 text-stone-400" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-800 mb-1">End of Scanned Pages</h4>
                  <p className="text-xs text-stone-500 max-w-[220px] mb-4">
                    All {totalPages} attached document pages have been displayed.
                  </p>

                  {onUploadPages && (
                    <label className="cursor-pointer text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs flex items-center gap-2 transition-all">
                      <Plus className="w-4 h-4" />
                      <span>Attach Additional Pages</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={onUploadPages}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Clean Bottom pocket lip */}
              <div
                className="w-full h-4 -mb-4 -mx-4 rounded-br-xl border-t border-stone-300/60"
                style={{
                  backgroundColor: "#e2dad0",
                  boxShadow: "0 -2px 6px rgba(0,0,0,0.05)"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Filmstrip Ribbon / Thumbnail Quick-Jumper */}
      {totalPages > 0 && (
        <div className="pt-2 border-t border-stone-200/80">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Document Leaves ({totalPages} Scans):
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              Click any leaf to jump & flip
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {attachments.map((att, idx) => {
              const isCurrentRight = idx === rightPageIndex;
              const isCurrentLeft = idx === leftPageIndex;
              const isActiveInSpread = isCurrentRight || isCurrentLeft;

              return (
                <button
                  key={`thumb-leaf-${idx}-${att.url}`}
                  onClick={() => handleJumpToPage(idx)}
                  className={`group relative shrink-0 w-16 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-all bg-white flex flex-col justify-between p-1 ${
                    isActiveInSpread
                      ? "border-amber-500 ring-2 ring-amber-300 shadow-md scale-105"
                      : "border-stone-200 opacity-60 hover:opacity-100 hover:border-stone-400"
                  }`}
                >
                  <div className="w-full flex-1 overflow-hidden flex items-center justify-center bg-stone-50 rounded">
                    {att.url.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                      <img
                        src={getFileUrl(att.url)}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <div className="mt-0.5 text-center font-mono font-bold text-[9px] text-stone-700 truncate">
                    P.{idx + 1}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Fullscreen Scan Viewer */}
      {zoomPage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white border-b border-white/15 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-amber-500 text-black font-mono font-bold text-xs">
                Page {zoomPage.pageNum} of {totalPages}
              </span>
              <span className="text-sm font-medium text-stone-200 font-mono truncate max-w-md">
                {zoomPage.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.25))}
                title="Zoom Out"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-stone-300 min-w-[45px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((s) => Math.min(3, s + 0.25))}
                title="Zoom In"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomRotation((r) => (r + 90) % 360)}
                title="Rotate 90°"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <a
                href={getFileUrl(zoomPage.url)}
                target="_blank"
                rel="noreferrer"
                title="Open in new window"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  setZoomPage(null);
                  setZoomScale(1);
                  setZoomRotation(0);
                }}
                title="Close Fullscreen"
                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={getFileUrl(zoomPage.url)}
              alt={zoomPage.name}
              style={{
                transform: `scale(${zoomScale}) rotate(${zoomRotation}deg)`,
                transition: "transform 0.2s ease-out"
              }}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
