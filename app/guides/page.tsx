"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import GuideCard from "@/components/GuideCard";
import { guides } from "@/lib/data";

const ALL_EXPERTISE = Array.from(
  new Set(guides.flatMap((g) => g.expertise))
).sort();

export default function GuidesPage() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return guides.filter((g) => {
      const matchesQuery =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q) ||
        g.expertise.some((e) => e.toLowerCase().includes(q)) ||
        g.shortBio.toLowerCase().includes(q);

      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.every((f) => g.expertise.includes(f));

      return matchesQuery && matchesFilters;
    });
  }, [query, activeFilters]);

  function toggleFilter(tag: string) {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearAll() {
    setQuery("");
    setActiveFilters([]);
  }

  const hasFilters = query.trim() || activeFilters.length > 0;

  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      {/* Page header */}
      <section className="bg-[#1A2B50] px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#F0A500] text-sm font-medium uppercase tracking-widest mb-3">
            All Guides
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-4">
            Find Your Guide
          </h1>
          <p className="text-blue-200 text-lg max-w-xl leading-relaxed">
            Browse our community of verified Sheikhs and scholars. Each one
            brings deep knowledge, genuine care, and a commitment to your
            privacy.
          </p>
        </div>
      </section>

      {/* Search + filter bar */}
      <section className="sticky top-16 z-40 bg-white border-b border-[#E8E2D6] shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9895a2]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, expertise, location…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D6] bg-[#FAF8F3] text-sm text-[#1B2B4B] placeholder:text-[#9895a2] focus:outline-none focus:border-[#1B2B4B] transition-colors"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || activeFilters.length > 0
                ? "bg-[#1A2B50] border-[#1A2B50] text-white"
                : "bg-white border-[#EAE3D4] text-[#1A2B50] hover:border-[#1A2B50]"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-[#C8680A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E8E2D6] text-sm text-[#6b6878] hover:text-[#1B2B4B] transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div className="max-w-6xl mx-auto mt-3 flex flex-wrap gap-2">
            {ALL_EXPERTISE.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  activeFilters.includes(tag)
                    ? "bg-[#1A2B50] border-[#1A2B50] text-white"
                    : "bg-white border-[#EAE3D4] text-[#4a4a5a] hover:border-[#1A2B50] hover:text-[#1A2B50]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Results */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Result count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[#6b6878]">
              {filtered.length === 0
                ? "No guides found"
                : `${filtered.length} guide${filtered.length === 1 ? "" : "s"} available`}
            </p>
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {activeFilters.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-1 text-xs bg-[#EEF1F8] text-[#2d4270] px-2.5 py-1 rounded-full"
                  >
                    {f}
                    <button
                      onClick={() => toggleFilter(f)}
                      className="hover:text-[#1B2B4B]"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-[#1B2B4B] mb-3">
                No guides found
              </p>
              <p className="text-[#6b6878] text-sm mb-6">
                Try adjusting your search or clearing the filters.
              </p>
              <button
                onClick={clearAll}
                className="text-sm bg-[#1A2B50] text-white px-6 py-2.5 rounded-xl hover:bg-[#2d4575] transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
