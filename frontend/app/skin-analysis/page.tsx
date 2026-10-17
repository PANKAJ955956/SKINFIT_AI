"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WebcamCapture } from "@/components/WebcamCapture";
import { ImageUploader } from "@/components/ImageUploader";
import {
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
  Info,
} from "lucide-react";
import { api } from "@/services/api";
import { SkinAssessment, QualityCheckResult } from "@/types";

export default function SkinAnalysisPage() {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [qualityCheck, setQualityCheck] = useState<QualityCheckResult | null>(null);
  const [assessment, setAssessment] = useState<SkinAssessment | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageInput = async (blob: Blob) => {
    setError(null);
    setAssessment(null);
    setCapturedBlob(blob);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));

    // Instant Quality Check
    setIsCheckingQuality(true);
    try {
      const qReport = await api.checkSkinQuality(blob);
      setQualityCheck(qReport);
    } catch (err: any) {
      console.warn("Quality check error:", err);
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const runFullAnalysis = async () => {
    if (!capturedBlob) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await api.analyzeSkin(capturedBlob);
      setAssessment(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze facial features. Please ensure valid lighting and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setCapturedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setQualityCheck(null);
    setAssessment(null);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Computer Vision Optical Mapping</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Facial Skin Health & Feature Scanner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Evaluate visible redness, blemish points, fine lines, texture roughness, and CIE L*a*b* Individual Typology Angle (ITA) skin tone.
          </p>
        </div>

        {/* Input Method Switcher */}
        {!capturedBlob && (
          <div className="flex items-center justify-center gap-3 p-1.5 max-w-xs mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode("camera")}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                mode === "camera"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Webcam</span>
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                mode === "upload"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          </div>
        )}

        {/* Capture or Upload Zone */}
        {!capturedBlob ? (
          <div>
            {mode === "camera" ? (
              <WebcamCapture onCapture={handleImageInput} overlayType="face" />
            ) : (
              <ImageUploader onFileSelected={handleImageInput} />
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Captured View & Quality Confirmation Bar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="w-36 h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-950">
                {previewUrl && (
                  <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Quality Pre-Flight Check
                  </span>
                  {qualityCheck?.is_valid && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High Precision Suitability
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Lighting condition: <strong className="capitalize text-slate-800 dark:text-slate-200">{qualityCheck?.lighting_condition || "Adequate"}</strong> | Face Detected: <strong className="text-slate-800 dark:text-slate-200">{qualityCheck?.face_detected ? "Yes" : "Searching"}</strong>
                  </p>
                  {qualityCheck?.feedback_messages && qualityCheck.feedback_messages.length > 0 && (
                    <p className="text-amber-600 dark:text-amber-400 text-[11px]">
                      {qualityCheck.feedback_messages.join(" • ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={resetScan}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Retake Photo
                </button>
                <button
                  onClick={runFullAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting Features...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run Skin Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Assessment Report View */}
            {assessment && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Visual Annotations */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-brand-500" />
                      <span>Segmented Feature Map</span>
                    </h3>

                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      {assessment.annotated_image_url ? (
                        <img
                          src={assessment.annotated_image_url}
                          alt="Annotated Scan"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={previewUrl || ""}
                          alt="Scan"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                        Blemishes / Redness
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        Pigmentation Spots
                      </span>
                    </div>
                  </div>

                  {/* Center Column: Clarity Index & ITA */}
                  <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                          Optical Report Summary
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                          Skin Clarity Index: {assessment.overall_clarity_score} / 100
                        </h2>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Estimated Profile</span>
                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400 capitalize">
                          {assessment.estimated_skin_type?.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-[11px] text-slate-400 font-medium block">Acne / Blemishes</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {assessment.acne_count}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-[11px] text-slate-400 font-medium block">Pigmentation</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {assessment.pigmentation_count}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-[11px] text-slate-400 font-medium block">Wrinkle Density</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {assessment.wrinkle_score} <span className="text-[10px] text-slate-400">/ 10</span>
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-[11px] text-slate-400 font-medium block">Texture Roughness</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {assessment.texture_score} <span className="text-[10px] text-slate-400">/ 10</span>
                        </span>
                      </div>
                    </div>

                    {/* Skin Tone Calibration */}
                    <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-brand-900 dark:text-brand-200">
                          Colorimetric Skin Tone (CIE L*a*b* ITA)
                        </span>
                        <span className="font-mono text-brand-700 dark:text-brand-300 font-bold">
                          {assessment.ita_angle}° ({assessment.skin_tone_label?.replace("_", " ").toUpperCase()})
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-800/80 dark:text-brand-300/80 leading-relaxed">
                        Calculated via Individual Typology Angle. Optical tone calibration ensures subsequent product matching recommends non-chalky mineral sunscreens and appropriate active concentrations.
                      </p>
                    </div>

                    {/* Limitations & Safeguards */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        Statutory Limitations & Disclaimers
                      </span>
                      <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                        {assessment.limitations.map((lim, idx) => (
                          <li key={idx}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
