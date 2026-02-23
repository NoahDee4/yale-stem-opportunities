"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mentor, MentorRole } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentorCard from "@/components/MentorCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";

export default function YourMentorsPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Listen to favorites, then hydrate mentor docs
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsub = onSnapshot(
      collection(db, "users", user.uid, "favoriteMentors"),
      async (favSnap) => {
        const ids = favSnap.docs.map((d) => d.id);
        setFavoriteIds(new Set(ids));

        if (ids.length === 0) {
          setMentors([]);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          ids.map((id) => getDoc(doc(db, "mentors", id)))
        );

        const hydrated: Mentor[] = results
          .filter((d) => d.exists())
          .map((d) => {
            const data = d.data()!;
            return {
              id: d.id,
              name: data.name,
              email: data.email,
              role: data.role as MentorRole,
              fields: data.fields || [],
              bio: data.bio || "",
              postedBy: data.postedBy,
              dateJoined:
                data.dateJoined instanceof Timestamp
                  ? data.dateJoined.toDate()
                  : new Date(data.dateJoined),
            };
          });

        setMentors(hydrated);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const handleToggleFavorite = async (mentorId: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "favoriteMentors", mentorId);
    try {
      if (favoriteIds.has(mentorId)) {
        await deleteDoc(ref);
        toast.success("Removed from saved mentors");
      } else {
        await setDoc(ref, { savedAt: Timestamp.now() });
        toast.success("Saved mentor! ❤️");
      }
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
              Sign in to see your saved mentors
            </h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Save mentors with the heart button to find them here.
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
            Saved Mentors
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
          >
            Mentors you&apos;ve saved to reach out to
          </motion.p>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark-secondary">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-3/4 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                      <div className="h-3 w-1/2 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                    <div className="h-3 w-5/6 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                  </div>
                </div>
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 text-5xl">🤝</div>
              <p className="text-[14px] font-medium text-text-primary dark:text-text-dark-primary">No saved mentors yet</p>
              <p className="mt-1 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                Hit the{" "}
                <span className="inline-block text-red-400">♥</span>
                {" "}on any mentor card on the{" "}
                <Link href="/mentorship" className="font-medium underline underline-offset-2 hover:no-underline">
                  Mentorship page
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                {mentors.length} saved mentor{mentors.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mentors.map((mentor, i) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    index={i}
                    isFavorited={favoriteIds.has(mentor.id)}
                    onToggleFavorite={() => handleToggleFavorite(mentor.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
