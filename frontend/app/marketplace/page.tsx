"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  ShoppingBag,
  Search,
  Filter,
  ExternalLink,
  Star,
  CheckCircle2,
  X,
  Sparkles,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/services/api";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedConcern, setSelectedConcern] = useState<string>("all");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params: any = {};
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (selectedConcern !== "all") params.concern = selectedConcern;
        if (search.trim()) params.search = search.trim();

        const data = await api.getProducts(params);
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory, selectedConcern, search]);

  const categories = [
    { id: "all", label: "All Items" },
    { id: "skincare", label: "Dermatological Skincare" },
    { id: "nutrition", label: "Nutritional Vitality" },
    { id: "fitness", label: "Posture & Recovery" },
  ];

  const concerns = [
    { id: "all", label: "All Concerns" },
    { id: "acne", label: "Acne & Pores" },
    { id: "pigmentation", label: "Pigmentation & Dark Spots" },
    { id: "barrier_repair", label: "Barrier Repair" },
    { id: "posture", label: "Spine & Posture" },
    { id: "hydration", label: "Cellular Hydration" },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Curated Formulations & Ergonomic Gear</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Verified Health & Skincare Marketplace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Clean, dermatologist-formulated skincare, bioavailable supplements, and posture correction tools with transparent ingredient disclosures.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredient, brand, or item..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={selectedConcern}
              onChange={(e) => setSelectedConcern(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {concerns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-0.5 rounded-full">
                    {product.subcategory}
                  </span>
                  {product.is_demo && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Demo Verified
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400">{product.brand}</p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Catalog Price</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatCurrency(product.price, product.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalProduct(product)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Specs
                  </button>
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-500/25 transition-all"
                    title="External Store Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Details Modal */}
        {activeModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    {activeModalProduct.category} • {activeModalProduct.subcategory}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeModalProduct.name}
                  </h3>
                  <p className="text-xs text-slate-400">{activeModalProduct.brand}</p>
                </div>
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeModalProduct.description}
              </p>

              {/* Full Ingredients List */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Complete Verified Formulation / Materials:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeModalProduct.ingredients.join(", ")}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(activeModalProduct.price, activeModalProduct.currency)}
                </span>
                <a
                  href={activeModalProduct.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/25"
                >
                  <span>Visit Retailer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
