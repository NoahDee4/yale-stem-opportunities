"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workshop } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkshopCard from "@/components/WorkshopCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SavedWorkshopsPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsub = onSnapshot(
      collection(db, "users", user.uid, "savedWorkshops"),
      async (snap) => {
        const ids = snap.docs.map((d) => d.id);
        setSavedIds(new Set(ids));

        if (ids.length === 0) {
          setWorkshops([]);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          ids.map((id) => getDoc(doc(db, "workshops", id)))
        );

        const ws: Workshop[] = results
          .filter((d) => d.exists())
          .map((d) => {
            const data = d.data()!;
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
      }
    );
    return () => unsub();
  }, [user]);

  const handleToggleFavorite = async (id: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "savedWorkshops", id);
    try {
      await deleteDoc(ref);
      toast.success("Removed from saved workshops");
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-5 text-5xl">❤️</div>
            <h2 className="mb-2 text-xl font-bold text-text-primary dark:text-text-dark-primary">
              Sign in to see your saved workshops
            </h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Save workshops with the heart button to find them here.
            </p>
            <button onClick={signIn} className="btn-primary">Sign in with Google</button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

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
            Saved Workshops
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
          >
            Workshops you&apos;ve saved to attend
          </motion.p>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
            {loading ? "Loading..." : (
              <>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">{workshops.length}</span>{" "}
                saved {workshops.length === 1 ? "workshop" : "workshops"}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border p-5 dark:border-border-dark">
                <div className="mb-3 h-5 w-3/4 rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="mb-2 h-4 w-full rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="mb-4 h-4 w-2/3 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="flex gap-1.5"><div className="h-5 w-16 rounded-md bg-surface-tertiary dark:bg-surface-dark-tertiary" /></div>
              </div>
            ))}
          </div>
        ) : workshops.length > 0 ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workshops.map((w, i) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                index={i}
                isFavorited={savedIds.has(w.id)}
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
            <div className="mb-3 text-4xl">🎓</div>
            <h3 className="mb-1 text-[15px] font-semibold text-text-primary dark:text-text-dark-primary">No saved workshops</h3>
            <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Press the heart icon on any workshop card on the{" "}
              <Link href="/workshops" className="font-medium underline underline-offset-2 hover:no-underline">Workshops page</Link>
              {" "}to save it here.
            </p>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
