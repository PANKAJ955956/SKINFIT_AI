"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Check,
  Info,
  RefreshCw,
  Sun,
  Moon,
  Tag,
} from "lucide-react";
import { api } from "@/services/api";
import { Recommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadRecs() {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, []);

  const handleFeedback = async (recId: string, isHelpful: boolean) => {
    try {
      await api.submitRecommendationFeedback(recId, isHelpful);
      setFeedbackSent((prev) => ({ ...prev, [recId]: true }));
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hybrid Algorithmic Matching</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Personalized AM/PM Skincare Protocol
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Each formula is matched against your detected facial features, known sensitivities, and barrier requirements with full algorithmic explainability.
          </p>
        </div>

        {/* Routine Grid */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm">Synthesizing personalized chemical matches...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec) => {
              const isFeedbackGiven = feedbackSent[rec.id];
              const isAM = rec.routine_step?.toLowerCase().includes("am");
              const isPM = rec.routine_step?.toLowerCase().includes("pm");

              return (
                <div
                  key={rec.id}
                  className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800 flex items-center gap-1.5">
                        {isAM && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        {isPM && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                        {rec.routine_step}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                        {Math.round(rec.match_score * 100)}% Match
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {rec.product?.name || "Targeted Botanical Formulation"}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400">
                        Brand: {rec.product?.brand || "Dermatological Science Lab"}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-slate-900 dark:text-white">Why Selected: </strong>
                      {rec.rationale}
                    </p>

                    {rec.safety_notes && rec.safety_notes.length > 0 && (
                      <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>{rec.safety_notes.join(" • ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-slate-400 block">Demonstration Price</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {rec.product?.price ? formatCurrency(rec.product.price) : "$24.00"}
                      </span>
                    </div>

                    <a
                      href={rec.product?.affiliate_url || "https://example.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all"
                    >
                      <span>View Retailer Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Explainability Feedback */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                      <span>Helpful?</span>
                      {isFeedbackGiven ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Feedback Saved
                        </span>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleFeedback(rec.id, true)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500"
                            title="Helpful recommendation"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(rec.id, false)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500"
                            title="Not relevant"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
