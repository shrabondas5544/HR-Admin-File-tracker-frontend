"use client";

import React, { useState } from "react";
import { FlatShelf, DocumentType, Magazine, ChecklistItem, DEFAULT_FILE_CHECKLIST } from "@/lib/types";
import { FileChecklistTable } from "./FileChecklistTable";
import { FileChecklistModal } from "./FileChecklistModal";
import { createFile, createMagazine, createFolder, createDocumentType, uploadAttachment } from "@/lib/api";
import { X, FileText, Box, FolderPlus, Settings2, Paperclip, CheckCircle, ClipboardList } from "lucide-react";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shelves: FlatShelf[];
  magazines: Magazine[];
  documentTypes: DocumentType[];
  onRefreshData: () => Promise<void>;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  shelves,
  magazines,
  documentTypes,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "magazine" | "folder" | "customType">("file");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // File Form State
  const [fileType, setFileType] = useState<"TEL" | "BLL" | "Custom">("TEL");
  const [fileDestination, setFileDestination] = useState<"magazine" | "shelf">("shelf");
  const [fileShelfId, setFileShelfId] = useState<number>(shelves[0]?.id || 1);
  const [fileMagazineId, setFileMagazineId] = useState<number>(magazines[0]?.id || 1);
  const [fileAttachmentUrl, setFileAttachmentUrl] = useState("");
  const [fileAttachmentName, setFileAttachmentName] = useState("");
  const [fileAttachments, setFileAttachments] = useState<Array<{ url: string; name: string }>>([]);

  // TEL & BLL Fields
  const [empName, setEmpName] = useState("");
  const [empNo, setEmpNo] = useState("");
  const [staffId, setStaffId] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => JSON.parse(JSON.stringify(DEFAULT_FILE_CHECKLIST)));
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  // Magazine Form State
  const [magName, setMagName] = useState("");
  const [magCode, setMagCode] = useState("");
  const [magColor, setMagColor] = useState("#2563EB");
  const [magShelfId, setMagShelfId] = useState<number>(shelves[0]?.id || 1);

  // Folder Form State
  const [fldName, setFldName] = useState("");
  const [fldCode, setFldCode] = useState("");
  const [fldColor, setFldColor] = useState("#10B981");
  const [fldShelfId, setFldShelfId] = useState<number>(shelves[0]?.id || 1);
  const [fldAttachmentUrl, setFldAttachmentUrl] = useState("");
  const [fldAttachmentName, setFldAttachmentName] = useState("");

  // Custom Document Schema State
  const [customTypeName, setCustomTypeName] = useState("");
  const [customTypeDesc, setCustomTypeDesc] = useState("");
  const [customFields, setCustomFields] = useState<Array<{ key: string; label: string; type: string }>>([
    { key: "documentNumber", label: "Document Number", type: "text" },
    { key: "issuedDate", label: "Issue Date", type: "date" }
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "file" | "folder") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const res = await uploadAttachment(file);
      const uploadPromises = Array.from(files).map((f) => uploadAttachment(f));
      const results = await Promise.all(uploadPromises);
      const newItems = results.map((res, i) => ({
        url: res.url,
        name: res.fileName || `Attachment ${i + 1}`
      }));

      if (target === "file") {
        setFileAttachmentUrl(res.url);
        setFileAttachmentName(res.fileName);
        setFileAttachments((prev) => [...prev, ...newItems]);
      } else {
        setFldAttachmentUrl(res.url);
        setFldAttachmentName(res.fileName);
        setFldAttachmentUrl(results[0]?.url || "");
        setFldAttachmentName(results[0]?.fileName || "");
      }
    } catch (err) {
      alert("Attachment upload failed: " + err);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      const docTypeObj = documentTypes.find((d) => d.name === fileType) || documentTypes[0];

      let finalCode = "";
      let finalTitle = "";
      let metaObj: Record<string, any> = {};

      if (fileType === "TEL") {
        finalCode = empNo.trim() || `TEL-${Date.now().toString().slice(-6)}`;
        finalTitle = `${empName.trim()} (${empNo.trim() || "TEL"})`;
        metaObj = {
          employeeName: empName.trim(),
          employeeNo: empNo.trim(),
          designation: designation.trim(),
          department: department.trim()
        };
      } else if (fileType === "BLL") {
        finalCode = staffId.trim() || `BLL-${Date.now().toString().slice(-6)}`;
        finalTitle = `${empName.trim()} (${staffId.trim() || "BLL"})`;
        metaObj = {
          employeeName: empName.trim(),
          staffId: staffId.trim(),
          designation: designation.trim(),
          department: department.trim()
        };
      } else {
        finalCode = empNo.trim() || `FILE-${Date.now().toString().slice(-6)}`;
        finalTitle = `${empName.trim()} (${empNo.trim() || "Custom"})`;
        metaObj = {
          employeeName: empName.trim(),
          employeeNo: empNo.trim(),
          designation: designation.trim(),
          department: department.trim()
        };
      }

      metaObj.checklist = checklist;

      await createFile({
        code: finalCode,
        title: finalTitle,
        documentTypeId: docTypeObj?.id,
        metadataJson: JSON.stringify(metaObj),
        magazineId: fileDestination === "magazine" ? fileMagazineId : undefined,
        shelfId: fileDestination === "shelf" ? fileShelfId : undefined,
        attachmentUrl: fileAttachments[0]?.url || undefined,
        attachmentName: fileAttachments[0]?.name || undefined,
        attachmentsJson: fileAttachments.length > 0 ? JSON.stringify(fileAttachments) : undefined
      });

      setSuccessMsg("File registered successfully!");
      setEmpName("");
      setEmpNo("");
      setStaffId("");
      setDesignation("");
      setDepartment("");
      setFileAttachmentUrl("");
      setFileAttachmentName("");
      setFileAttachments([]);
      setChecklist(JSON.parse(JSON.stringify(DEFAULT_FILE_CHECKLIST)));
      await onRefreshData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMagazine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await createMagazine({
        name: magName.trim(),
        code: magCode.trim(),
        colorHex: magColor,
        shelfId: magShelfId
      });
      setSuccessMsg("Magazine created successfully!");
      setMagName("");
      setMagCode("");
      await onRefreshData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await createFolder({
        name: fldName.trim(),
        code: fldCode.trim(),
        colorHex: fldColor,
        shelfId: fldShelfId,
        attachmentUrl: fldAttachmentUrl || undefined,
        attachmentName: fldAttachmentName || undefined
      });
      setSuccessMsg("Folder binder created successfully!");
      setFldName("");
      setFldCode("");
      setFldAttachmentUrl("");
      setFldAttachmentName("");
      await onRefreshData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomType = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await createDocumentType({
        name: customTypeName.trim(),
        description: customTypeDesc.trim(),
        fieldsJson: JSON.stringify(customFields)
      });
      setSuccessMsg("Custom document type registered!");
      setCustomTypeName("");
      setCustomTypeDesc("");
      await onRefreshData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-lg bg-white border-r border-stone-200 h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-wide">Record Registration Drawer</h2>
            <p className="text-xs text-stone-500">File documents, create magazines, or add standalone binders</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("file");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "file" ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            File
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("magazine");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "magazine" ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Magazine
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("folder");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "folder" ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Folder
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("customType");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "customType" ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Schema
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 1. FILE CREATOR */}
          {activeTab === "file" && (
            <form onSubmit={handleCreateFile} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-600 uppercase tracking-wider font-bold block mb-1">
                  Document Template Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["TEL", "BLL", "Custom"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFileType(t)}
                      className={`py-2 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                        fileType === t
                          ? "bg-stone-200 text-stone-900 border-stone-400"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>



              {/* Template Fields */}
              <div className="bg-stone-50/60 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  {fileType} Cover Page Metadata
                </div>
                <div>
                  <label className="text-stone-600 block mb-1">Employee / Record Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name of employee"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                  />
                </div>

                {fileType === "TEL" && (
                  <div>
                    <label className="text-stone-600 block mb-1">Employee No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TEL-1082"
                      value={empNo}
                      onChange={(e) => setEmpNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 font-mono"
                    />
                  </div>
                )}

                {fileType === "BLL" && (
                  <div>
                    <label className="text-stone-600 block mb-1">Staff ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BLL-ST-5091"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 font-mono"
                    />
                  </div>
                )}

                {fileType === "Custom" && (
                  <div>
                    <label className="text-stone-600 block mb-1">Reference / ID No. (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. ADM-9001"
                      value={empNo}
                      onChange={(e) => setEmpNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 font-mono"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-600 block mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Area Sales Officer"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Consumer Electronics"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* Employee Personal File Checklist Button */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        Personal File Checklist
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Transcom Electronics Limited (19 Documents)
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white text-stone-800 border border-stone-300 font-bold shadow-2xs">
                    Official Index
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      ✓ {checklist.filter((i) => i.status === "YES").length} Yes
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-bold">
                      ✗ {checklist.filter((i) => i.status === "NO").length} No
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChecklistModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Open Checklist Form</span>
                  </button>
                </div>
              </div>

              {/* Physical Destination */}
              <div>
                <label className="text-stone-600 uppercase tracking-wider font-bold block mb-1.5">
                  Physical Storage Destination
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setFileDestination("shelf")}
                    className={`py-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      fileDestination === "shelf"
                        ? "bg-stone-200 text-stone-900 border-stone-400"
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Direct on Shelf
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileDestination("magazine")}
                    className={`py-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      fileDestination === "magazine"
                        ? "bg-stone-200 text-stone-900 border-stone-400"
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    Inside a Magazine Box
                  </button>
                </div>

                {fileDestination === "shelf" ? (
                  <div>
                    <label className="text-stone-600 block mb-1">Select Shelf</label>
                    <select
                      value={fileShelfId}
                      onChange={(e) => setFileShelfId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                    >
                      {shelves.map((s) => (
                        <option key={`s-opt-${s.id}`} value={s.id}>
                          {s.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-stone-600 block mb-1">Select Magazine Box</label>
                    <select
                      value={fileMagazineId}
                      onChange={(e) => setFileMagazineId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                    >
                      {magazines.map((m) => (
                        <option key={`m-opt-${m.id}`} value={m.id}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Digital Twin Attachment */}
              <div className="bg-stone-50/60 p-4 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-stone-800 font-bold flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-stone-600" />
                    Attach Scans & Picture(s)
                  </label>
                  {fileAttachments.length > 0 && (
                    <span className="text-[11px] font-mono font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-300">
                      {fileAttachments.length} {fileAttachments.length === 1 ? "page" : "pages"}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "file")}
                  className="w-full text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-900 hover:file:bg-stone-300 cursor-pointer"
                />
                {fileAttachments.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto">
                    {fileAttachments.map((att, idx) => (
                      <div
                        key={`new-att-${idx}`}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 text-[11px]"
                      >
                        <span className="font-mono text-stone-700 truncate max-w-[260px]">
                          {idx + 1}. {att.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFileAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {loading ? "Registering File..." : "Register File Record"}
              </button>
            </form>
          )}

          {/* 2. MAGAZINE CREATOR */}
          {activeTab === "magazine" && (
            <form onSubmit={handleCreateMagazine} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-700 font-bold block mb-1">Magazine Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Leases & Plant Deeds"
                  value={magName}
                  onChange={(e) => setMagName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 font-bold block mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAG-LEG-01"
                    value={magCode}
                    onChange={(e) => setMagCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-700 font-bold block mb-1">Spine Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={magColor}
                      onChange={(e) => setMagColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={magColor}
                      onChange={(e) => setMagColor(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-stone-700 font-bold block mb-1">Shelf Location</label>
                <select
                  value={magShelfId}
                  onChange={(e) => setMagShelfId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                >
                  {shelves.map((s) => (
                    <option key={`m-shelf-${s.id}`} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {loading ? "Creating..." : "Place Magazine on Shelf"}
              </button>
            </form>
          )}

          {/* 3. FOLDER CREATOR */}
          {activeTab === "folder" && (
            <form onSubmit={handleCreateFolder} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-700 font-bold block mb-1">Folder Binder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NBR Tax Assessment Binder"
                  value={fldName}
                  onChange={(e) => setFldName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 font-bold block mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLD-TAX-2025"
                    value={fldCode}
                    onChange={(e) => setFldCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-700 font-bold block mb-1">Spine Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fldColor}
                      onChange={(e) => setFldColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={fldColor}
                      onChange={(e) => setFldColor(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-stone-700 font-bold block mb-1">Shelf Location</label>
                <select
                  value={fldShelfId}
                  onChange={(e) => setFldShelfId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                >
                  {shelves.map((s) => (
                    <option key={`f-shelf-${s.id}`} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-stone-50/60 p-4 rounded-xl border border-stone-200">
                <label className="text-stone-800 font-bold block mb-1 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-stone-600" />
                  Attachment (Photo or PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, "folder")}
                  className="w-full text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-900 hover:file:bg-stone-300 cursor-pointer"
                />
                {fldAttachmentName && (
                  <div className="mt-2 text-stone-800 font-mono text-[11px] truncate">
                    Attached: {fldAttachmentName}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {loading ? "Creating..." : "Place Folder on Shelf"}
              </button>
            </form>
          )}

          {/* 4. DYNAMIC CUSTOM TYPE SCHEMA MANAGER */}
          {activeTab === "customType" && (
            <form onSubmit={handleCreateCustomType} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-700 font-bold block mb-1">Custom Document Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Confirmation, Legal Notice"
                  value={customTypeName}
                  onChange={(e) => setCustomTypeName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                />
              </div>

              <div>
                <label className="text-stone-700 font-bold block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Purpose of this document type"
                  value={customTypeDesc}
                  onChange={(e) => setCustomTypeDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-stone-400/50 focus:border-stone-400"
                />
              </div>

              <div className="bg-stone-50/60 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Custom Field Definitions
                </div>
                {customFields.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => {
                        const copy = [...customFields];
                        copy[i].label = e.target.value;
                        setCustomFields(copy);
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-stone-200 rounded text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 text-xs"
                    />
                    <select
                      value={f.type}
                      onChange={(e) => {
                        const copy = [...customFields];
                        copy[i].type = e.target.value;
                        setCustomFields(copy);
                      }}
                      className="px-2 py-1.5 bg-white border border-stone-200 rounded text-stone-900 focus:ring-stone-400/50 focus:border-stone-400 text-xs"
                    >
                      <option value="text">Text</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {loading ? "Registering Schema..." : "Save Custom Type Definition"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Pop-up Modal for Employee Personal File Checklist */}
      <FileChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        checklist={checklist}
        onChange={setChecklist}
        employeeName={empName}
        fileCode={fileType === "TEL" ? empNo : staffId}
        documentTypeName={fileType}
      />
    </div>
  );
};
