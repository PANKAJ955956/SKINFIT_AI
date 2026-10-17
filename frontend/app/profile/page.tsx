"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  User,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
  RefreshCw,
} from "lucide-react";
import { api } from "@/services/api";
import { UserProfile } from "@/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 26,
    gender: "female",
    height_cm: 168,
    weight_kg: 58,
    activity_level: "moderate",
    fitness_goal: "skin_glow_and_posture",
    self_reported_skin_type: "combination",
    skin_concerns: ["acne", "pigmentation"],
    known_allergies: [],
    dietary_preferences: ["pescatarian"],
    budget_tier: "moderate",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await api.getMe();
        if (me.profile) {
          setProfile(me.profile);
        }
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setStatusMessage("Profile preferences successfully updated.");
    } catch (err: any) {
      setStatusMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImages = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently erase all your uploaded facial and posture photos from storage? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await api.deleteAccountImages();
      setDeleteStatus(res.message);
    } catch (err: any) {
      setDeleteStatus("Failed to purge photos.");
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <User className="w-3.5 h-3.5" />
            <span>Account & Biometric Privacy</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Profile & Privacy Controls
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your physiological baselines, dietary exclusions, and GDPR image erasure settings.
          </p>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Biometric & Fitness Baseline */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Biometric Baseline Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  value={profile.age || ""}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={profile.height_cm || ""}
                  onChange={(e) => setProfile({ ...profile, height_cm: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={profile.weight_kg || ""}
                  onChange={(e) => setProfile({ ...profile, weight_kg: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Skin Profile & Allergies */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Skin Profile & Sensitivities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Self-Reported Skin Type
                </label>
                <select
                  value={profile.self_reported_skin_type || "combination"}
                  onChange={(e) => setProfile({ ...profile, self_reported_skin_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none capitalize"
                >
                  <option value="combination">Combination</option>
                  <option value="oily">Oily</option>
                  <option value="dry">Dry</option>
                  <option value="sensitive">Sensitive</option>
                  <option value="normal">Normal / Balanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Budget Tier for Recommendations
                </label>
                <select
                  value={profile.budget_tier || "moderate"}
                  onChange={(e) => setProfile({ ...profile, budget_tier: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none capitalize"
                >
                  <option value="budget">Budget Friendly (&lt; $20)</option>
                  <option value="moderate">Moderate / Clinical ($20 - $40)</option>
                  <option value="premium">Premium Prestige ($40+)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Updating..." : "Save Preferences"}</span>
          </button>
        </form>

        {/* GDPR Privacy & Right to Erasure */}
        <div className="p-7 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-red-900 dark:text-red-300">
              Data Privacy & GDPR Right to Erasure
            </h3>
          </div>

          <p className="text-xs text-red-800/80 dark:text-red-300/80 leading-relaxed">
            In compliance with international data privacy laws (GDPR Art. 17 and CCPA), you can unilaterally and permanently wipe all facial photographs, body posture images, and biometric file assets stored on our servers.
          </p>

          <button
            type="button"
            onClick={handleDeleteImages}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Permanently Delete All My Images</span>
          </button>

          {deleteStatus && (
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 pt-1">
              {deleteStatus}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
