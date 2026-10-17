"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import {
  Sparkles,
  Activity,
  Flame,
  CheckCircle2,
  TrendingUp,
  Apple,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Bot,
  Calendar,
} from "lucide-react";
import { api } from "@/services/api";
import { SkinAssessment, BodyAssessment, ProgressSummary, User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [skinAssessment, setSkinAssessment] = useState<SkinAssessment | null>(null);
  const [bodyAssessment, setBodyAssessment] = useState<BodyAssessment | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [me, skins, bodies, prog] = await Promise.allSettled([
          api.getMe(),
          api.getSkinAssessments(),
          api.getBodyHistory(),
          api.getProgress(),
        ]);

        if (me.status === "fulfilled") setUser(me.value);
        if (skins.status === "fulfilled" && skins.value.length > 0) setSkinAssessment(skins.value[0]);
        if (bodies.status === "fulfilled" && bodies.value.length > 0) setBodyAssessment(bodies.value[0]);
        if (prog.status === "fulfilled") setProgress(prog.value);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Precision Protocol
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.full_name || "Wellness Explorer"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Here is your synchronized skin clarity, posture metrics, and daily lifestyle routine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/skin-analysis"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Skin Scan</span>
            </Link>
            <Link
              href="/assistant"
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-brand-400 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Bot className="w-4 h-4 text-brand-500" />
              <span>Ask AI Coach</span>
            </Link>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Skin Clarity */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Skin Clarity Score</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {skinAssessment ? `${skinAssessment.overall_clarity_score}` : "85.0"}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.2% vs previous baseline</span>
            </div>
          </div>

          {/* Card 2: Posture Score */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Posture Alignment</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {bodyAssessment ? `${bodyAssessment.posture_score}` : "88.0"}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {bodyAssessment?.detected_deviations?.[0] || "Optimal cervical vertical plumb-line"}
            </p>
          </div>

          {/* Card 3: BMI Status */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">BMI Classification</span>
              <div className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-accent-950/60 text-accent-600 dark:text-accent-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {bodyAssessment ? `${bodyAssessment.bmi_value}` : "22.4"}
              </span>
              <span className="text-xs font-bold text-emerald-600 capitalize">
                {bodyAssessment ? bodyAssessment.bmi_category.replace("_", " ") : "Normal weight"}
              </span>
            </div>
            <p className="text-xs text-slate-500">WHO safe zone: 18.5 - 24.9</p>
          </div>

          {/* Card 4: Daily Wellness Streak */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Consistency Streak</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {progress?.current_streak_days || 5}
              </span>
              <span className="text-xs font-bold text-slate-400">days streak</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Daily routine adhered
            </p>
          </div>
        </div>

        {/* Two-Column Core Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Recent Skin Findings */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Optical Skin Feature Report
                  </h3>
                  <p className="text-xs text-slate-400">
                    Latest non-invasive calibrated scan
                  </p>
                </div>
              </div>
              <Link
                href="/skin-analysis"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                Scan Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium">
              <div>
                <span className="text-slate-400 block text-[11px]">Skin Tone (ITA)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {skinAssessment?.skin_tone_label?.replace("_", " ") || "Intermediate (32.4°)"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated Barrier Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {skinAssessment?.estimated_skin_type?.replace("_", " ") || "Combination / Balanced"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Blemish Points Count</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {skinAssessment ? `${skinAssessment.acne_count} localized spots` : "2 focal spots"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Hyperpigmentation</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {skinAssessment ? `${skinAssessment.pigmentation_count} spots` : "3 mild macules"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-brand-400 pl-3">
              "{skinAssessment?.summary || "Skin barrier shows healthy baseline hydration with minor focal redness on right cheek. Continue daily SPF 50+ broad-spectrum photoprotection."}"
            </p>
          </div>

          {/* Right Column: Daily Wellness & Corrective Movement */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-accent-950/60 text-accent-600 dark:text-accent-400 flex items-center justify-center">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Personalized Protocol
                  </h3>
                  <p className="text-xs text-slate-400">
                    Corrective drills and gut-skin meals
                  </p>
                </div>
              </div>
              <Link
                href="/wellness"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                Full Plan <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Thoracic Extension & Foam Roller Opener
                    </h4>
                    <p className="text-[11px] text-slate-400">3 sets × 10 extensions (Counters desk kyphosis)</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-1 rounded-md">
                  Posture
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mediterranean Wild Salmon & Quinoa Bowl
                    </h4>
                    <p className="text-[11px] text-slate-400">38g Protein, EPA/DHA Omega-3s for barrier repair</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-1 rounded-md">
                  Nutrition
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Target Water Intake: <strong className="text-slate-800 dark:text-slate-200">2.6 Liters</strong></span>
              <span>Caloric Floor Guard: <strong className="text-emerald-600">Active</strong></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
