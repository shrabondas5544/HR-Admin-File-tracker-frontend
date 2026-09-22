"use client";

import React, { useState, useEffect } from "react";
import { RecordFile, Folder, FileAttachment, parseAttachments, ChecklistItem, parseChecklist } from "@/lib/types";
import {
  X,
  Paperclip,
  ExternalLink,
  Edit3,
  Save,
  User,
  Trash2,
  FolderOutput,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Image as ImageIcon
} from "lucide-react";
import { getFileUrl, uploadAttachment } from "@/lib/api";
import { FileChecklistTable } from "./FileChecklistTable";
import { FileChecklistModal } from "./FileChecklistModal";

interface ItemDetailModalProps {
  item: { type: "File" | "Folder"; data: RecordFile | Folder } | null;
  onClose: () => void;
  onSaveFile?: (file: RecordFile) => Promise<void>;
  onSaveFolder?: (folder: Folder) => Promise<void>;
  onDeleteItem?: (type: "File" | "Folder", id: number, name: string) => void;
  onExtractFile?: (fileId: number) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onSaveFile,
  onSaveFolder,
  onDeleteItem,
  onExtractFile
}) => {
  if (!item) return null;

  const isFile = item.type === "File";
  const fileData = isFile ? (item.data as RecordFile) : null;
  const folderData = !isFile ? (item.data as Folder) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(isFile ? fileData?.title || "" : folderData?.name || "");
  const [code, setCode] = useState(isFile ? fileData?.code || "" : folderData?.code || "");
  const [colorHex, setColorHex] = useState(!isFile ? folderData?.colorHex || "#3b82f6" : "#3b82f6");

  // Multi-page attachments state
  const [attachments, setAttachments] = useState<FileAttachment[]>(() =>
    parseAttachments(item.data.attachmentsJson, item.data.attachmentUrl, item.data.attachmentName)
  );
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState(item.data.attachmentUrl || "");
  const [attachmentName, setAttachmentName] = useState(item.data.attachmentName || "");
  const [saveStatus, setSaveStatus] = useState<string>("");

  const [metaFields, setMetaFields] = useState<Record<string, any>>(() => {
    if (isFile && fileData?.metadataJson) {
      try {
        return JSON.parse(fileData.metadataJson);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    parseChecklist(fileData?.metadataJson)
  );
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  useEffect(() => {
    if (!item) return;
    const isF = item.type === "File";
    const fData = isF ? (item.data as RecordFile) : null;
    const fldData = !isF ? (item.data as Folder) : null;
    setTitle(isF ? fData?.title || "" : fldData?.name || "");
    setCode(isF ? fData?.code || "" : fldData?.code || "");
    setColorHex(!isF ? fldData?.colorHex || "#3b82f6" : "#3b82f6");
    const parsedAtts = parseAttachments(item.data.attachmentsJson, item.data.attachmentUrl, item.data.attachmentName);
    setAttachments(parsedAtts);
    setActivePageIndex(0);
    setAttachmentUrl(item.data.attachmentUrl || "");
    setAttachmentName(item.data.attachmentName || "");
    if (isF && fData?.metadataJson) {
      try {
        setMetaFields(JSON.parse(fData.metadataJson));
      } catch {
        setMetaFields({});
      }
      setChecklist(parseChecklist(fData.metadataJson));
    } else {
      setMetaFields({});
      setChecklist(isF ? parseChecklist(undefined) : []);
    }
    setIsEditing(false);
  }, [item]);

  const currentPage = attachments[Math.min(activePageIndex, Math.max(0, attachments.length - 1))];

  // Immediate Auto-Save to Backend API
  const persistAttachments = async (newAttachments: FileAttachment[]) => {
    setSaveStatus("Saving...");
    try {
      if (isFile && onSaveFile && fileData) {
        await onSaveFile({
          ...fileData,
          title,
          code,
          metadataJson: JSON.stringify({ ...metaFields, checklist }),
          attachmentsJson: JSON.stringify(newAttachments),
          attachmentUrl: newAttachments[0]?.url || "",
          attachmentName: newAttachments[0]?.name || ""
        });
      } else if (!isFile && onSaveFolder && folderData) {
        await onSaveFolder({
          ...folderData,
          name: title,
          code,
          colorHex,
          attachmentsJson: JSON.stringify(newAttachments),
          attachmentUrl: newAttachments[0]?.url || "",
          attachmentName: newAttachments[0]?.name || ""
        });
      }
      setSaveStatus("Saved ✓");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error("Auto-save failed:", err);
      setSaveStatus("Save failed");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setSaveStatus("Uploading...");

    try {
      const res = await uploadAttachment(file);
      setAttachmentUrl(res.url);
      setAttachmentName(res.fileName);
      const uploadPromises = Array.from(files).map((f) => uploadAttachment(f));
      const results = await Promise.all(uploadPromises);

      const newPages: FileAttachment[] = results.map((r, i) => ({
        url: r.url,
        name: r.fileName || `Page ${attachments.length + i + 1}`
      }));

      const updated = [...attachments, ...newPages];
      setAttachments(updated);
      setActivePageIndex(updated.length - 1);
      await persistAttachments(updated);
    } catch (err) {
      alert("Attachment upload failed: " + err);
      setSaveStatus("");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeletePage = async (indexToDelete: number) => {
    const pageName = attachments[indexToDelete]?.name || `Page ${indexToDelete + 1}`;
    if (!confirm(`Delete ${pageName}?`)) return;

    const updated = attachments.filter((_, idx) => idx !== indexToDelete);
    setAttachments(updated);
    if (activePageIndex >= updated.length) {
      setActivePageIndex(Math.max(0, updated.length - 1));
    }
    await persistAttachments(updated);
  };

  const handleSave = async () => {
    if (isFile && onSaveFile && fileData) {
      await onSaveFile({
        ...fileData,
        title,
        code,
        metadataJson: JSON.stringify({ ...metaFields, checklist }),
        attachmentsJson: JSON.stringify(attachments),
        attachmentUrl: attachments[0]?.url || "",
        attachmentName: attachments[0]?.name || ""
      });
    } else if (!isFile && onSaveFolder && folderData) {
      await onSaveFolder({
        ...folderData,
        name: title,
        code,
        colorHex,
        attachmentsJson: JSON.stringify(attachments),
        attachmentUrl: attachments[0]?.url || "",
        attachmentName: attachments[0]?.name || ""
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 rounded-full bg-amber-500" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">
                  {isFile ? "Record Dossier Digital Twin" : "Standalone Binder Specification"}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-100 text-amber-800 border border-stone-200">
                  {code}
                </span>
                {isFile && fileData?.magazineId && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                    Inside Magazine Box
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">Physical Archive Synchronization</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Metadata
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info Card */}
          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Title / Subject
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <div className="text-base font-semibold text-stone-900">{title}</div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Unique Identification Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <div className="text-base font-mono text-amber-800 font-bold">{code}</div>
                )}
              </div>
            </div>

            {!isFile && (
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Binder Spine Color
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-32 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-900"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-stone-200 shadow-xs" style={{ backgroundColor: colorHex }} />
                    <span className="font-mono text-xs text-stone-700">{colorHex}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Structured Document Metadata */}
          {isFile && (
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  Official Form Metadata (TEL / BLL / Admin)
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  Type: {fileData?.documentType?.name || "Standard Form"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-xs text-stone-600 block mb-1">Employee Name / Contact</label>
                      <input
                        type="text"
                        value={metaFields.employeeName || ""}
                        onChange={(e) => setMetaFields({ ...metaFields, employeeName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-600 block mb-1">
                        {metaFields.staffId !== undefined ? "Staff ID" : "Employee No. / ID"}
                      </label>
                      <input
                        type="text"
                        value={metaFields.staffId !== undefined ? metaFields.staffId : (metaFields.employeeNo || "")}
                        onChange={(e) => {
                          if (metaFields.staffId !== undefined) {
                            setMetaFields({ ...metaFields, staffId: e.target.value });
                          } else {
                            setMetaFields({ ...metaFields, employeeNo: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-600 block mb-1">Designation</label>
                      <input
                        type="text"
                        value={metaFields.designation || ""}
                        onChange={(e) => setMetaFields({ ...metaFields, designation: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-600 block mb-1">Department</label>
                      <input
                        type="text"
                        value={metaFields.department || ""}
                        onChange={(e) => setMetaFields({ ...metaFields, department: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                      <div className="text-[11px] text-stone-500 uppercase font-bold">Employee Name</div>
                      <div className="text-sm font-semibold text-stone-900 mt-0.5">
                        {metaFields.employeeName || metaFields.subject || "—"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                      <div className="text-[11px] text-stone-500 uppercase font-bold">
                        {metaFields.staffId ? "Staff ID" : "Employee No. / Reference"}
                      </div>
                      <div className="text-sm font-mono text-amber-800 font-bold mt-0.5">
                        {metaFields.staffId || metaFields.employeeNo || metaFields.category || "—"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                      <div className="text-[11px] text-stone-500 uppercase font-bold">Designation / Role</div>
                      <div className="text-sm text-stone-800 mt-0.5">
                        {metaFields.designation || metaFields.issuedBy || "—"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                      <div className="text-[11px] text-stone-500 uppercase font-bold">Department / Division</div>
                      <div className="text-sm text-stone-800 mt-0.5">
                        {metaFields.department || metaFields.fiscalYear || "—"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}


          {/* Employee Personal File Checklist Button - Files only */}
          {isFile && (
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-950">
                      Personal File Checklist
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Transcom Electronics Limited (19 Documents Index)
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white text-amber-900 border border-amber-300 font-bold shadow-2xs">
                  Official Form
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                    ✓ {checklist.filter((i) => i.status === "YES").length} Yes
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-bold">
                    ✗ {checklist.filter((i) => i.status === "NO").length} No
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                    {checklist.filter((i) => i.status === "NONE").length} Unchecked
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChecklistModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>View / Edit Checklist</span>
                </button>
              </div>
            </div>
          )}


          {/* Digital Twin Snapshot / Multi-Page Scan Section */}
          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Digital Twin Scans & Pictures
                </span>
                {attachments.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono font-semibold">
                    {attachments.length} {attachments.length === 1 ? "Page" : "Pages"}
                  </span>
                )}
                {saveStatus && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {saveStatus}
                  </span>
                )}
              </div>

              {/* Add Page / Multiple Pages Button */}
              <label className="cursor-pointer text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5 transition-colors shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Picture(s) / Page(s)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploading ? (
              <div className="py-8 text-center text-xs text-amber-700">Uploading digital copy...</div>
            ) : attachments.length > 0 ? (
              <div className="space-y-3">
                {/* Active Page Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-lg border border-stone-200 shadow-2xs gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activePageIndex <= 0}
                      className="p-1 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                      Page {activePageIndex + 1} of {attachments.length}
                    </span>

                    <button
                      onClick={() => setActivePageIndex((prev) => Math.min(attachments.length - 1, prev + 1))}
                      disabled={activePageIndex >= attachments.length - 1}
                      className="p-1 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <span className="text-xs text-stone-700 font-mono truncate max-w-xs ml-2">
                      {currentPage?.name || `Page ${activePageIndex + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentPage && (
                      <a
                        href={getFileUrl(currentPage.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-amber-700 hover:underline font-semibold px-2 py-1 bg-amber-50 rounded border border-amber-200"
                      >
                        <span>View Full Scan</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDeletePage(activePageIndex)}
                      title="Delete this page"
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Page</span>
                    </button>
                  </div>
                </div>

                {/* Main Preview for Active Page */}
                {currentPage && (
                  <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex flex-col items-center justify-center p-3 min-h-[220px] max-h-[360px]">
                    {currentPage.url.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                      <img
                        src={getFileUrl(currentPage.url)}
                        alt={`Page ${activePageIndex + 1}`}
                        className="object-contain max-h-[340px] rounded-lg shadow-xs"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-10">
                        <FileText className="w-12 h-12 text-amber-600" />
                        <span className="text-xs text-stone-700 font-medium font-mono">{currentPage.name}</span>
                        <a
                          href={getFileUrl(currentPage.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs"
                        >
                          Open Document in New Tab
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Thumbnail Filmstrip if multiple pages attached */}
                {attachments.length > 1 && (
                  <div className="pt-2 border-t border-stone-200">
                    <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                      All Attached Pages ({attachments.length}):
                    </div>
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                      {attachments.map((att, idx) => {
                        const isActive = idx === activePageIndex;
                        return (
                          <div
                            key={`thumb-${idx}-${att.url}`}
                            onClick={() => setActivePageIndex(idx)}
                            className={`relative shrink-0 w-20 h-24 rounded-lg border-2 overflow-hidden cursor-pointer transition-all bg-white flex flex-col justify-between p-1 ${
                              isActive
                                ? "border-amber-500 ring-2 ring-amber-300 shadow-md scale-102"
                                : "border-stone-200 opacity-70 hover:opacity-100 hover:border-slate-400"
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
                                <FileText className="w-6 h-6 text-stone-400" />
                              )}
                            </div>
                            <div className="mt-1 text-center font-mono font-bold text-[9px] text-stone-700 truncate">
                              Page {idx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-400 text-xs border border-dashed border-stone-200 rounded-lg bg-white flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <span className="font-medium text-stone-600">No pictures or pages attached yet.</span>
                <label className="cursor-pointer text-xs font-semibold text-amber-800 hover:underline bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors">
                  Click here to select and attach multiple pictures / pages
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Footer (Extract + Delete Button + Close) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isFile && fileData?.magazineId && onExtractFile && (
              <button
                onClick={() => {
                  onExtractFile(fileData.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 text-xs font-semibold rounded-xl border border-amber-300 transition-colors cursor-pointer"
              >
                <FolderOutput className="w-3.5 h-3.5" />
                Extract to Shelf Track
              </button>
            )}

            {onDeleteItem && (
              <button
                onClick={() => {
                  onDeleteItem(
                    item.type,
                    item.data.id,
                    isFile ? fileData!.title : folderData!.name
                  );
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete {item.type}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-slate-300 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Pop-up Modal for Employee Personal File Checklist */}
      <FileChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        checklist={checklist}
        onChange={setChecklist}
        onSaveAndClose={async (updated) => {
          setChecklist(updated);
          if (onSaveFile && fileData) {
            await onSaveFile({
              ...fileData,
              title,
              code,
              metadataJson: JSON.stringify({ ...metaFields, checklist: updated }),
              attachmentsJson: JSON.stringify(attachments),
              attachmentUrl: attachments[0]?.url || "",
              attachmentName: attachments[0]?.name || ""
            });
          }
        }}
        isReadOnly={false}
        employeeName={metaFields.employeeName || title}
        fileCode={code}
        documentTypeName={fileData?.documentType?.name}
      />
    </div>
  );
};
