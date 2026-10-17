"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, CheckCircle, AlertTriangle } from "lucide-react";

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelected,
  acceptedFormats = "image/jpeg,image/png,image/webp",
  maxSizeMB = 15,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a supported image file (JPEG, PNG, WEBP).");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File exceeds maximum size of ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ${
            dragActive
              ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedFormats}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag & Drop high-resolution photograph
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports JPEG, PNG, or WEBP up to {maxSizeMB}MB
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            Browse from Device
          </button>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl">
          <div className="relative aspect-[4/3] w-full">
            <img
              src={previewUrl}
              alt="Selected Preview"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium truncate max-w-[200px]">
                {selectedFile?.name}
              </span>
              <span className="text-[10px] text-slate-400">
                ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Change
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
