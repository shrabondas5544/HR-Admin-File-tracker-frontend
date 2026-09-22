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

  const folderColor = colorHex || "#51C4EC";

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
    <div className="p-3 md:p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col gap-3 select-none bg-stone-50/80">
      {/* Top Navigation & Controls Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-stone-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Flipbook View
          </span>
          {totalPages > 0 && (
            <span
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: folderColor }}
            >
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
            <div className="flex items-center bg-white rounded-lg border border-stone-200 px-3 py-1 shadow-2xs text-xs font-mono text-stone-700">
              <span className="font-bold text-stone-900">
                {rightPageIndex !== null ? `Page ${rightPageIndex + 1}` : "End"}
              </span>
              <span className="text-stone-400 mx-1.5">of</span>
              <span>{totalPages}</span>
            </div>
          )}

          {/* Upload Button */}
          {onUploadPages && (
            <label className="cursor-pointer text-xs font-bold text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors">
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
        <div className="py-2.5 text-center text-xs font-semibold text-stone-700 bg-white rounded-lg border border-stone-200 animate-pulse">
          Uploading scan... Please wait.
        </div>
      )}

      {/* Main Folder Stage Styled in the Exact File Color */}
      <div className="relative w-full overflow-hidden flex flex-col items-center">
        {/* Navigation Floating Arrows */}
        {/* Previous Page Arrow */}
        <button
          onClick={handlePrevFlip}
          disabled={activeTurnIndex <= 0 || isFlipping}
          title="Flip to Previous Page"
          className={`absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white text-stone-700 shadow-lg border border-stone-200 hover:bg-stone-50 hover:text-stone-950 disabled:opacity-0 disabled:pointer-events-none cursor-pointer transition-all ${
            activeTurnIndex > 0 ? "scale-100 hover:scale-110 ring-2 ring-stone-400/30" : ""
          }`}
        >
          <ChevronLeft className="w-5 h-5 stroke-2" />
        </button>

        {/* Next Page Arrow */}
        <button
          onClick={handleNextFlip}
          disabled={activeTurnIndex >= totalPages || isFlipping}
          title="Flip to Next Page"
          className={`absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white text-stone-700 shadow-lg border border-stone-200 hover:bg-stone-50 hover:text-stone-950 disabled:opacity-0 disabled:pointer-events-none cursor-pointer transition-all ${
            activeTurnIndex < totalPages ? "scale-100 hover:scale-110 ring-2 ring-stone-400/30" : ""
          }`}
        >
          <ChevronRight className="w-5 h-5 stroke-2" />
        </button>

        {/* Folder Presentation Body with Dynamic File Color */}
        <div
          className="w-full max-w-4xl py-2 px-1 md:px-4"
          style={{ perspective: "1800px" }}
        >
          <div
            className="relative w-full rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-stretch justify-center gap-0 border shadow-2xl transition-all duration-300"
            style={{
              backgroundColor: folderColor,
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.12) 100%)",
              borderColor: "rgba(0,0,0,0.12)",
              boxShadow:
                "0 20px 40px -15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.12)"
            }}
          >
            {/* Spine Fold Crease Shadow */}
            <div
              className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 30%, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0.1) 100%)"
              }}
            />

            {/* ---------------- LEFT PANEL ---------------- */}
            <div className="flex-1 min-h-[350px] md:min-h-[420px] flex flex-col justify-between relative rounded-l-xl p-3 md:p-4 bg-white/95 border-r border-stone-200/80 shadow-inner overflow-hidden">
              {leftPageAttachment ? (
                /* Scanned Document Page on Left Leaf */
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
                        className="max-h-[300px] md:max-h-[340px] w-auto object-contain rounded shadow-md border border-stone-200 transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-lg border border-stone-200 shadow-sm text-center">
                        <FileText className="w-12 h-12 text-stone-500 mb-2" />
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
                /* Inside Front Cover Info */
                <div className="flex-1 flex flex-col justify-between select-none">
                  {/* Upper Folder Information Header */}
                  <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/80">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                        style={{ backgroundColor: folderColor }}
                      />
                      <span className="font-mono font-bold text-xs text-stone-800 tracking-wide">
                        {code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-stone-600 font-semibold border border-stone-200">
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

                  {/* Left Pocket in Matching File Color */}
                  <div
                    className="relative w-full rounded-xl p-3 mt-4 border flex items-center justify-end overflow-hidden"
                    style={{
                      height: "90px",
                      backgroundColor: folderColor,
                      backgroundImage:
                        "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.08) 100%)",
                      borderColor: "rgba(0,0,0,0.1)"
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold bg-black/15 px-2.5 py-1 rounded-md border border-white/20 shadow-2xs">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Document Leaf</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------- RIGHT PANEL ---------------- */}
            <div className="flex-1 min-h-[350px] md:min-h-[420px] flex flex-col justify-between relative rounded-r-xl p-3 md:p-4 bg-white/95 border-l border-stone-200/80 shadow-inner overflow-hidden">
              {rightPageAttachment ? (
                /* Scanned Document Page on Right Leaf */
                <div className="flex-1 flex flex-col justify-between relative group">
                  {/* Page Top Header Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-stone-600 font-mono">
                    <span className="font-bold px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800">
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
                        className="max-h-[300px] md:max-h-[340px] w-auto object-contain rounded shadow-md border border-stone-200 transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-lg border border-stone-200 shadow-sm text-center">
                        <FileText className="w-12 h-12 text-stone-500 mb-2" />
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
                /* Inside Back Cover Info / End of Pages */
                <div className="flex-1 flex flex-col justify-between select-none">
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white mb-3 shadow-sm"
                      style={{ backgroundColor: folderColor }}
                    >
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h5 className="font-bold text-sm text-stone-800 mb-1">
                      {totalPages === 0 ? "No Scanned Pages Yet" : "End of Folder Pages"}
                    </h5>
                    <p className="text-xs text-stone-500 max-w-[220px]">
                      {totalPages === 0
                        ? "Click '+ Add Picture(s)' above to attach pages into this folder."
                        : "You have reached the end of the scanned pages."}
                    </p>
                  </div>

                  {/* Right Pocket in Matching File Color */}
                  <div
                    className="relative w-full rounded-xl p-3 mt-4 border flex items-center justify-start overflow-hidden"
                    style={{
                      height: "90px",
                      backgroundColor: folderColor,
                      backgroundImage:
                        "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.08) 100%)",
                      borderColor: "rgba(0,0,0,0.1)"
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold bg-black/15 px-2.5 py-1 rounded-md border border-white/20 shadow-2xs">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Document Leaf</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Leaf Strip / Thumbnails Navigation */}
      {totalPages > 0 && (
        <div className="mt-1 pt-2 border-t border-stone-200/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 custom-scrollbar">
            {attachments.map((att, idx) => {
              const isActive = idx === rightPageIndex || idx === leftPageIndex;
              return (
                <button
                  key={`${att.url}-${idx}`}
                  onClick={() => handleJumpToPage(idx)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? "bg-stone-800 text-white border-stone-800 font-bold shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span className="opacity-75">P.{idx + 1}</span>
                  <span className="truncate max-w-[90px] text-[11px]">{att.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {zoomPage && (
        <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-xs flex flex-col items-center justify-between p-4">
          {/* Lightbox Header Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-stone-700">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-700 border border-stone-600">
                Page {zoomPage.pageNum}
              </span>
              <span className="font-medium text-sm truncate max-w-sm">
                {zoomPage.name}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.25))}
                title="Zoom Out"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer border border-stone-700"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-12 text-center text-stone-300">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((s) => Math.min(3, s + 0.25))}
                title="Zoom In"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer border border-stone-700"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomRotation((r) => (r + 90) % 360)}
                title="Rotate Clockwise"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer border border-stone-700 ml-1"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoomScale(1);
                  setZoomRotation(0);
                }}
                className="text-xs px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer border border-stone-700 ml-1"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setZoomPage(null);
                  setZoomScale(1);
                  setZoomRotation(0);
                }}
                className="p-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white cursor-pointer ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Content Area */}
          <div className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-4">
            {zoomPage.url.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
              <img
                src={getFileUrl(zoomPage.url)}
                alt={zoomPage.name}
                style={{
                  transform: `scale(${zoomScale}) rotate(${zoomRotation}deg)`,
                  transition: "transform 0.15s ease-out"
                }}
                className="max-h-[80vh] max-w-full object-contain rounded shadow-2xl"
              />
            ) : (
              <iframe
                src={getFileUrl(zoomPage.url)}
                title={zoomPage.name}
                className="w-full h-[80vh] rounded-lg border border-stone-700 bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
