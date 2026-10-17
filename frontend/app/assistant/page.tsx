"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  Info,
} from "lucide-react";
import { api } from "@/services/api";
import { ChatMessage, Citation } from "@/types";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your SkinFit AI Clinical Wellness Coach. I can analyze active skincare ingredients (ceramides, BHA, niacinamide, SPF), biomechanical posture kinematics, and anti-inflammatory nutrition.\n\nHow can I support your wellness goals today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [expandedCitations, setExpandedCitations] = useState<Record<number, boolean>>({});

  const samplePrompts = [
    "What active ingredients help fade post-acne dark spots?",
    "How do I correct forward head posture from desk work?",
    "What foods reduce skin inflammation and strengthen the barrier?",
    "Should I apply mineral sunscreen before or after moisturizer?",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.sendAssistantMessage(query, conversationId);
      setConversationId(response.conversation_id);
      setMessages((prev) => [...prev, response.message]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error connecting to the knowledge retrieval engine. Please ensure your query does not violate safety policies and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCitation = (idx: number) => {
    setExpandedCitations((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto flex flex-col justify-between space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Bot className="w-3.5 h-3.5" />
            <span>RAG Grounded Intelligence Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Clinical AI Wellness Advisor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every response is grounded in dermatology and kinetic research with direct citations.
          </p>
        </div>

        {/* Clinical Disclaimer Alert */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            <strong>Educational Protocol:</strong> The assistant does not diagnose diseases or prescribe medications. Inquire about skincare, posture, and wellness.
          </span>
        </div>

        {/* Conversation Message Stream */}
        <div className="flex-1 min-h-[420px] max-h-[580px] overflow-y-auto space-y-5 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 text-sm ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl space-y-3 leading-relaxed whitespace-pre-line text-xs ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white rounded-br-none"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700/60"
                }`}
              >
                <div>{msg.content}</div>

                {/* Grounded RAG Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => toggleCitation(i)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{msg.citations.length} Grounded Knowledge References</span>
                      {expandedCitations[i] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {expandedCitations[i] && (
                      <div className="mt-2 space-y-1.5">
                        {msg.citations.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px]"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              Source: {c.source}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 italic">
                              "{c.snippet}"
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <span>Searching clinical vector index & synthesizing response...</span>
            </div>
          )}
        </div>

        {/* Prompt Pills */}
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about active serums, thoracic mobility, macro splits..."
            className="flex-1 px-4 py-2.5 bg-transparent text-xs focus:outline-none text-slate-900 dark:text-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
