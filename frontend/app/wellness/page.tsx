"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Apple,
  Dumbbell,
  Droplet,
  Sparkles,
  Flame,
  CheckCircle2,
  RefreshCw,
  Utensils,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/services/api";
import { WellnessPlan, Exercise, FoodItem } from "@/types";

export default function WellnessPage() {
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"meals" | "exercises">("meals");

  useEffect(() => {
    async function loadData() {
      try {
        const [exList, foodList] = await Promise.all([
          api.getExercises(),
          api.getFoods(),
        ]);
        setExercises(exList);
        setFoods(foodList);

        // Try generating or fetching wellness plan
        const plan = await api.generateWellnessPlan();
        setWellnessPlan(plan);
      } catch (err) {
        console.error("Wellness data error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleRegeneratePlan = async () => {
    setGenerating(true);
    try {
      const newPlan = await api.generateWellnessPlan();
      setWellnessPlan(newPlan);
    } catch (err) {
      console.error("Plan regeneration error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-950/50 border border-accent-200/80 dark:border-accent-800/60 text-xs font-semibold text-accent-700 dark:text-accent-300">
              <Apple className="w-3.5 h-3.5" />
              <span>Evidence-Based Nutrition & Movement</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Holistic Wellness & Meal Protocol
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Personalized macro targets, gut-skin axis foods, and posture-corrective exercises.
            </p>
          </div>

          <button
            onClick={handleRegeneratePlan}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-400 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
            <span>Regenerate Protocol</span>
          </button>
        </div>

        {/* Nutritional Target Card */}
        {wellnessPlan && (
          <div className="p-7 rounded-3xl bg-gradient-to-br from-brand-900 via-slate-900 to-slate-900 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  Target Daily Energy Expenditure
                </span>
                <h2 className="text-3xl font-extrabold">
                  {wellnessPlan.daily_calorie_target} <span className="text-lg font-normal text-slate-400">kcal/day</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <span>Hydration Benchmark: {wellnessPlan.hydration_liters} Liters</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-slate-400 font-medium block">Protein</span>
                <span className="text-xl font-bold text-emerald-400">
                  {wellnessPlan.protein_grams}g
                </span>
                <span className="text-[10px] text-slate-400 block">Dermal repair</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-slate-400 font-medium block">Carbohydrates</span>
                <span className="text-xl font-bold text-amber-300">
                  {wellnessPlan.carbs_grams}g
                </span>
                <span className="text-[10px] text-slate-400 block">Low-glycemic index</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-slate-400 font-medium block">Essential Fats</span>
                <span className="text-xl font-bold text-teal-300">
                  {wellnessPlan.fats_grams}g
                </span>
                <span className="text-[10px] text-slate-400 block">Omega-3 EPA/DHA</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigator */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("meals")}
            className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "meals"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Daily Gut-Skin Meals</span>
          </button>
          <button
            onClick={() => setActiveTab("exercises")}
            className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "exercises"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Corrective Exercise Drills</span>
          </button>
        </div>

        {/* Tab 1: Meals */}
        {activeTab === "meals" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wellnessPlan?.meals && wellnessPlan.meals.length > 0 ? (
              wellnessPlan.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                        {meal.meal_type}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        {meal.calories} kcal
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {meal.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {meal.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>P: {meal.protein_g}g</span>
                      <span>C: {meal.carbs_g}g</span>
                      <span>F: {meal.fats_g}g</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {meal.dietary_tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              foods.map((food) => (
                <div
                  key={food.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                    {food.category.replace("_", " ")}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {food.name}
                  </h3>
                  <p className="text-xs text-slate-500">{food.skin_wellness_benefits}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Exercises */}
        {activeTab === "exercises" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                    {ex.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {ex.difficulty} • {ex.equipment.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {ex.name}
                </h3>

                <p className="text-xs text-brand-700 dark:text-brand-300 bg-brand-50/70 dark:bg-brand-950/40 p-3 rounded-xl border border-brand-100 dark:border-brand-900/40 font-medium">
                  <strong>Posture Benefit:</strong> {ex.posture_benefit}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Execution Steps:</span>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                    {ex.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
