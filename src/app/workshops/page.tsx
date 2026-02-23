"use client";

import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workshop, FieldTag, WorkshopFormat, FIELD_TAGS, WORKSHOP_FORMATS } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkshopCard from "@/components/WorkshopCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function WorkshopsPage() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedFields, setSelectedFields] = useState<FieldTag[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<WorkshopFormat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "workshops"), orderBy("datePosted", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const ws: Workshop[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          description: data.description,
          location: data.location,
          eventDate:
            data.eventDate instanceof Timestamp
              ? data.eventDate.toDate()
              : new Date(data.eventDate),
          eventEndTime: data.eventEndTime
            ? (data.eventEndTime instanceof Timestamp
                ? data.eventEndTime.toDate()
                : new Date(data.eventEndTime))
            : undefined,
          fieldTags: data.fieldTags || [],
          format: data.format,
          contact: Array.isArray(data.contact) ? data.contact : [data.contact].filter(Boolean),
          datePosted:
            data.datePosted instanceof Timestamp
              ? data.datePosted.toDate()
              : new Date(data.datePosted),
          postedBy: data.postedBy,
          postedByName: data.postedByName || "Anonymous",
          anonymous: data.anonymous ?? false,
        };
      });
      setWorkshops(ws);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) { setFavoriteIds(new Set()); return; }
    const unsub = onSnapshot(
      collection(db, "users", user.uid, "savedWorkshops"),
      (snap) => setFavoriteIds(new Set(snap.docs.map((d) => d.id)))
    );
    return () => unsub();
  }, [user]);

  const handleToggleFavorite = async (id: string) => {
    if (!user) { toast.error("Sign in to save workshops"); return; }
    const ref = doc(db, "users", user.uid, "savedWorkshops", id);
    try {
      if (favoriteIds.has(id)) {
        await deleteDoc(ref);
        toast.success("Removed from saved workshops");
      } else {
        await setDoc(ref, { addedAt: new Date() });
        toast.success("Workshop saved ❤️");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const filtered = useMemo(() => {
    return workshops.filter((w) => {
      if (selectedFields.length > 0 && !w.fieldTags.some((f) => selectedFields.includes(f))) return false;
      if (selectedFormats.length > 0 && !selectedFormats.includes(w.format)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [workshops, selectedFields, selectedFormats, searchQuery]);

  const activeFilters = selectedFields.length + selectedFormats.length;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 lg:px-10">
        <div className="pb-2 pt-12">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-1 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary md:text-3xl"
          >
            Workshops
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
          >
            STEM workshops, seminars & events from the Yale community
          </motion.p>
        </div>

        {/* Search + Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="sticky top-[57px] z-40 -mx-6 bg-white/80 px-6 py-4 backdrop-blur-xl dark:bg-surface-dark/80"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-dark-tertiary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !pl-10 !py-2.5"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                showFilters || activeFilters > 0
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
                <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
                <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
                <line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" /><line x1="17" x2="23" y1="16" y2="16" />
              </svg>
              Filters
              {activeFilters > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black dark:bg-black dark:text-white">
                  {activeFilters}
                </span>
              )}
            </button>
            {user && (
              <Link href="/submit-workshop" className="btn-primary hidden !py-2.5 md:inline-flex">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
                </svg>
                Post
              </Link>
            )}
          </div>

          {/* Active filter pills */}
          {activeFilters > 0 && !showFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {selectedFormats.map((f) => (
                <button key={f} onClick={() => setSelectedFormats(selectedFormats.filter((x) => x !== f))}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${getTagColor(f).pill}`}>
                  {f}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              ))}
              {selectedFields.map((f) => (
                <button key={f} onClick={() => setSelectedFields(selectedFields.filter((x) => x !== f))}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${getTagColor(f).pill}`}>
                  {f}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              ))}
              <button
                onClick={() => { setSelectedFields([]); setSelectedFormats([]); }}
                className="text-[11px] font-medium text-text-tertiary hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
              >Clear all</button>
            </div>
          )}
        </motion.div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-surface-secondary p-5 dark:border-border-dark dark:bg-surface-dark-secondary">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-dark-tertiary">Format</p>
                    <div className="flex flex-wrap gap-2">
                      {WORKSHOP_FORMATS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setSelectedFormats(selectedFormats.includes(f) ? selectedFormats.filter((x) => x !== f) : [...selectedFormats, f])}
                          className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                            selectedFormats.includes(f) ? getTagColor(f).active : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                          }`}
                        >{f}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-dark-tertiary">Academic Field</p>
                    <div className="flex flex-wrap gap-2">
                      {FIELD_TAGS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setSelectedFields(selectedFields.includes(f) ? selectedFields.filter((x) => x !== f) : [...selectedFields, f])}
                          className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                            selectedFields.includes(f) ? getTagColor(f).active : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                          }`}
                        >{f}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="mt-6 mb-4">
          <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
            {loading ? "Loading..." : (
              <><span className="font-semibold text-text-primary dark:text-text-dark-primary">{filtered.length}</span>{" "}{filtered.length === 1 ? "workshop" : "workshops"}</>
            )}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border p-5 dark:border-border-dark">
                <div className="mb-3 h-5 w-3/4 rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="mb-2 h-4 w-full rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="mb-4 h-4 w-2/3 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="flex gap-1.5"><div className="h-5 w-16 rounded-md bg-surface-tertiary dark:bg-surface-dark-tertiary" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((w, i) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                index={i}
                isFavorited={favoriteIds.has(w.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-3 text-4xl">🔍</div>
            <h3 className="mb-1 text-[15px] font-semibold text-text-primary dark:text-text-dark-primary">No workshops found</h3>
            <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </main>

      {/* Mobile FAB */}
      {user && (
        <Link
          href="/submit-workshop"
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        </Link>
      )}

      <Footer />
    </div>
  );
}
