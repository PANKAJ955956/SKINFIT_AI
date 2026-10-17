"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  Activity,
  ArrowRight,
  CheckCircle,
  Eye,
  Zap,
  Bot,
  HeartPulse,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-500/10 via-accent-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-brand-800 dark:text-brand-200 tracking-wide uppercase">
            Full-Stack Precision Wellness Intelligence
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Decode Your Skin. Align Your Body.{" "}
          <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-accent-500 bg-clip-text text-transparent">
            Power Your Vitality.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Clinical computer vision for real-time facial feature mapping and posture kinematics, combined with evidence-grounded RAG intelligence and personalized nutrition.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/skin-analysis"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 hover:from-brand-500 hover:to-accent-400 text-white font-bold text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 group transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Facial Skin Scan</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/body-analysis"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 text-slate-800 dark:text-slate-200 font-bold text-base shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all"
          >
            <Activity className="w-5 h-5 text-brand-500" />
            <span>Analyze Posture & Body</span>
          </Link>
        </div>

        {/* Trust & Methodology Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-brand-500" />
            <span>Calibrated CIE L*a*b* ITA Colorimetry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-brand-500" />
            <span>33-Point MediaPipe Pose Kinematics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-brand-500" />
            <span>Grounded RAG Clinical Knowledge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-brand-500" />
            <span>Strict GDPR Right-to-Erasure</span>
          </div>
        </div>
      </section>

      {/* Interactive Architecture & Feature Showcase */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Integrated Multi-Modal Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Engineered with Scientific Rigor, Not Guesswork
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              We never fabricate melanin concentrations or clinical pathology. Our algorithms provide reproducible, objective optical metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Facial Feature Mapping
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Localized blemish and redness extraction, CIE L*a*b* ITA skin-tone assessment, and high-frequency edge analysis for forehead and periorbital fine lines.
              </p>
              <Link
                href="/skin-analysis"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2"
              >
                Explore Skin Scan <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Posture & Biomechanics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Extracts skeletal keypoints to calculate craniovertebral neck tilt, shoulder imbalances, and spinal verticality. Includes WHO BMI safeguards.
              </p>
              <Link
                href="/body-analysis"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2"
              >
                Analyze Ergonomics <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-950/60 text-accent-600 dark:text-accent-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                RAG Clinical AI Advisor
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Vector retrieval with ChromaDB/FAISS indexes verified clinical dermatology and biomechanics literature, providing cited, hallucination-free guidance.
              </p>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2"
              >
                Consult Advisor <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Flow Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
              Complete End-to-End Workflow
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              From Camera Snapshot to Daily Precision Protocol
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Step into your personalized dashboard. Track your skin clarity scores over time, access targeted AM/PM chemical exfoliation routines, and rebalance desk posture with targeted mobility drills.
            </p>
            <div className="flex gap-4 pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/marketplace"
                className="px-6 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 font-semibold text-sm hover:bg-slate-700 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-slate-300">Live Metric Simulation</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Verified
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Skin Clarity Index:</span>
                <span className="text-emerald-400 font-bold">88.4 / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ITA Tone Classification:</span>
                <span className="text-teal-300">Intermediate (34.2°)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Craniovertebral Angle:</span>
                <span className="text-amber-400">14.1° (Forward Head)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Calorie Deficit Guard:</span>
                <span className="text-emerald-400">Active (Safe Floor)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
