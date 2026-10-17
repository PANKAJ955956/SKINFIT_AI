import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SkinFit AI — Clinical Skin, Body & Wellness Intelligence",
  description: "AI-powered facial skin feature detection, body posture kinematics, evidence-based nutrition plans, and personalized routines.",
  keywords: ["skincare AI", "posture analysis", "wellness AI", "dermatology intelligence", "computer vision health"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        
        {/* Global Clinical & Educational Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold">Clinical & Safety Disclaimer: </span>
              SkinFit AI is an educational digital coaching and optical computer vision analysis platform. The software, vision pipelines, and AI conversational modules do not provide medical diagnoses, clinical pathology interpretations, or prescription pharmacotherapy. All nutritional and posture recommendations are intended for wellness optimization in eligible adults.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
              <p>© {new Date().getFullYear()} SkinFit AI Technologies Inc. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <span>Privacy Shield & GDPR Compliant</span>
                <span>Zero Melanin Fabrications</span>
                <span>Evidence-Grounded RAG</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
