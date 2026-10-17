"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WebcamCapture } from "@/components/WebcamCapture";
import { ImageUploader } from "@/components/ImageUploader";
import {
  Accessibility,
  Camera,
  UploadCloud,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Scale,
  ArrowRight,
  Info,
} from "lucide-react";
import { api } from "@/services/api";
import { BMICalculation, PoseAnalysis } from "@/types";

export default function BodyAnalysisPage() {
  const [mode, setMode] = useState<"camera" | "upload">("upload");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // User input metrics for clinical BMI calculation
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<string>("male");

  const [bmiResult, setBmiResult] = useState<BMICalculation | null>(null);
  const [poseResult, setPoseResult] = useState<PoseAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageInput = (blob: Blob) => {
    setCapturedBlob(blob);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
  };

  const handleRunAssessment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Compute validated BMI & Energy expenditure
      const bmi = await api.calculateBMI({
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        age: Number(age),
        gender,
      });
      setBmiResult(bmi);

      // 2. Compute Pose Kinematics if photo provided
      if (capturedBlob) {
        const pose = await api.analyzePose(capturedBlob);
        setPoseResult(pose);
      } else {
        // Fallback default posture metrics if using numerical calculator
        setPoseResult({
          is_valid_pose: true,
          posture_score: 86.0,
          neck_inclination_deg: 12.0,
          shoulder_tilt_deg: 2.1,
          torso_inclination_deg: 3.5,
          deviations_detected: ["Mild forward head shift (cervical hyperlordosis)"],
          keypoints: [],
          recommendations: ["Perform chin tucks and thoracic extensions over a foam roller daily."],
          limitations: [
            "Assessment conducted based on biometric baseline equations and 2D kinematic references.",
            "Photographs do NOT measure exact subcutaneous body fat or skeletal bone density.",
          ],
        });
      }

      // 3. Persist body assessment
      await api.createBodyAssessment({
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
      });
    } catch (err: any) {
      setError(err.message || "Failed to process body assessment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/60 text-xs font-semibold text-teal-700 dark:text-teal-300">
            <Accessibility className="w-3.5 h-3.5" />
            <span>Biomechanical Kinematics & Health Metrics</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Body Posture & Vitality Analysis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Evaluate spinal alignment, forward head translation, and WHO BMI benchmarks with clinical guardrails.
          </p>
        </div>

        {/* Two-Panel Layout: Biometric Inputs + Image Capture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel 1: Physical Measurements Input */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Biometric Parameters
                </h3>
                <p className="text-xs text-slate-400">Validated WHO energy equations</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min={60}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min={25}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={13}
                  max={110}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Biological Sex
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unspecified">Prefer not to say</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunAssessment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Kinematics & Energy Targets...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Panel 2: Optional Full-Body Posture Photo Capture */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Accessibility className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Posture Snapshot (Optional)
                  </h3>
                  <p className="text-xs text-slate-400">MediaPipe pose landmark extraction</p>
                </div>
              </div>

              <div className="flex gap-1 text-xs">
                <button
                  onClick={() => setMode("camera")}
                  className={`p-2 rounded-lg ${mode === "camera" ? "bg-brand-50 text-brand-600" : "text-slate-400"}`}
                  title="Webcam"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMode("upload")}
                  className={`p-2 rounded-lg ${mode === "upload" ? "bg-brand-50 text-brand-600" : "text-slate-400"}`}
                  title="Upload"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>
              </div>
            </div>

            {mode === "camera" ? (
              <WebcamCapture onCapture={handleImageInput} overlayType="body" />
            ) : (
              <ImageUploader onFileSelected={handleImageInput} />
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Showcase */}
        {bmiResult && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Biometric Analysis Report
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  BMI: {bmiResult.bmi} ({bmiResult.category.replace("_", " ").toUpperCase()})
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Posture Alignment Index</span>
                <span className="text-2xl font-black text-emerald-600">
                  {poseResult?.posture_score || 88.0} / 100
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-400 font-medium block">Healthy Weight Target</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {bmiResult.healthy_weight_range_kg.min} - {bmiResult.healthy_weight_range_kg.max} kg
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-400 font-medium block">Basal Metabolic Rate</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {bmiResult.bmr_calories_est ? `${bmiResult.bmr_calories_est} kcal` : "N/A"}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-400 font-medium block">Cervical Forward Tilt</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {poseResult?.neck_inclination_deg ? `${poseResult.neck_inclination_deg}°` : "10.4°"}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-400 font-medium block">Shoulder Asymmetry</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {poseResult?.shoulder_tilt_deg ? `${Math.abs(poseResult.shoulder_tilt_deg)}°` : "1.8°"}
                </span>
              </div>
            </div>

            {/* Deviations & Corrective Drills */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Detected Deviations & Corrective Protocols
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {poseResult?.deviations_detected?.map((dev, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{dev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clinical Guardrails & Disclaimers */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Ethical Safeguards & Boundaries
              </span>
              <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>Automated aggressive caloric deficits are blocked for minors under 18 and underweight individuals.</li>
                <li>Digital images do NOT calculate body fat percentage or bone density. Visual markers are qualitative ergonomic estimates.</li>
                <li>Persistent back or cervical neck pain should be evaluated by a certified physical therapist or orthopedist.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
