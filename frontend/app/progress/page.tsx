"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Flame,
  Droplet,
  CheckCircle2,
  Calendar,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "@/services/api";
import { ProgressSummary, ProgressRecord } from "@/types";

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [weightInput, setWeightInput] = useState<string>("68.5");
  const [waterInput, setWaterInput] = useState<string>("2.5");
  const [skinInput, setSkinInput] = useState<string>("85");
  const [workoutChecked, setWorkoutChecked] = useState<boolean>(true);
  const [notesInput, setNotesInput] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await api.getProgress();
        setProgress(data);
      } catch (err) {
        console.error("Progress data error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  const handleLogDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.logProgress({
        weight_kg: Number(weightInput),
        water_intake_liters: Number(waterInput),
        skin_clarity_score: Number(skinInput),
        workout_completed: workoutChecked,
        notes: notesInput,
      });

      // Reload
      const updated = await api.getProgress();
      setProgress(updated);
      setNotesInput("");
    } catch (err) {
      console.error("Failed to log progress", err);
    } finally {
      setSaving(false);
    }
  };

  // Sample or formatted chart data
  const chartData = [
    { day: "Mon", skin: 78, weight: 69.2 },
    { day: "Tue", skin: 80, weight: 69.0 },
    { day: "Wed", skin: 82, weight: 68.8 },
    { day: "Thu", skin: 81, weight: 68.9 },
    { day: "Fri", skin: 84, weight: 68.6 },
    { day: "Sat", skin: 85, weight: 68.5 },
    { day: "Sun", skin: 88, weight: 68.3 },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Quantitative Health Progression</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Biometric Progress & Trend Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track daily hydration, skin clarity evolution, and workout adherence.
          </p>
        </div>

        {/* Executive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500">Current Streak</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {progress?.current_streak_days || 7}
              </span>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <Flame className="w-4 h-4" /> Consecutive Days
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500">Skin Clarity Delta</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">+10.0 pts</span>
              <span className="text-xs font-bold text-slate-400">over 14 days</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500">Total Completed Workouts</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
                {progress?.total_workouts || 12}
              </span>
              <span className="text-xs font-bold text-slate-400">sessions</span>
            </div>
          </div>
        </div>

        {/* Charts & Log Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart View */}
          <div className="lg:col-span-2 p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Skin Clarity & Weight Trend
              </h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-teal-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                  Clarity Index
                </span>
                <span className="flex items-center gap-1.5 text-brand-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                  Weight (kg)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="skin"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: "#14b8a6", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#0d9488"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: "#0d9488", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Log Form */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-500" />
              <span>Log Today's Metrics</span>
            </h3>

            <form onSubmit={handleLogDaily} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Water Intake (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Estimated Skin Clarity (0-100)
                </label>
                <input
                  type="number"
                  value={skinInput}
                  onChange={(e) => setSkinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={workoutChecked}
                  onChange={(e) => setWorkoutChecked(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Completed Daily Mobility Drills
                </span>
              </label>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Notes / Observations
                </label>
                <input
                  type="text"
                  placeholder="e.g. skin feels hydrated, no neck tension"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
              >
                {saving ? "Logging..." : "Save Today's Entry"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
