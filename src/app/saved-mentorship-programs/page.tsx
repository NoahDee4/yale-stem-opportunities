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
import { MentorshipProgram } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentorshipProgramCard from "@/components/MentorshipProgramCard";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SavedMentorshipProgramsPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPrograms([]);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      collection(db, "users", user.uid, "savedMentorshipPrograms"),
      async (snap) => {
        const ids = snap.docs.map((d) => d.id);
        const settled = await Promise.all(
          ids.map((id) => getDoc(doc(db, "mentorshipPrograms", id)))
        );
        const ps: MentorshipProgram[] = settled
          .filter((d) => d.exists())
          .map((d) => {
            const data = d.data()!;
            return {
              id: d.id,
              title: data.title,
              description: data.description,
              link: data.link,
              fieldTags: data.fieldTags || [],
              contact: data.contact || "",
              datePosted:
                data.datePosted instanceof Timestamp
                  ? data.datePosted.toDate()
                  : new Date(data.datePosted),
              postedBy: data.postedBy,
              postedByName: data.postedByName || "Anonymous",
              anonymous: data.anonymous ?? false,
            };
          });
        setPrograms(ps);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleRemove = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "savedMentorshipPrograms", id));
      toast.success("Removed from saved programs");
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
            <h2 className="mb-2 text-xl font-bold text-text-primary dark:text-text-dark-primary">Sign in to see saved programs</h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Sign in to view the mentorship programs you&apos;ve saved.
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
            Saved Programs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
          >
            Mentorship programs you&apos;ve saved for later
          </motion.p>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
            {loading ? "Loading..." : (
              <><span className="font-semibold text-text-primary dark:text-text-dark-primary">{programs.length}</span>{" "}{programs.length === 1 ? "program" : "programs"}</>
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
              </div>
            ))}
          </div>
        ) : programs.length > 0 ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {programs.map((p, i) => (
              <MentorshipProgramCard
                key={p.id}
                program={p}
                index={i}
                isFavorited
                onToggleFavorite={handleRemove}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-3 text-4xl">❤️</div>
            <h3 className="mb-1 text-[15px] font-semibold text-text-primary dark:text-text-dark-primary">No saved programs yet</h3>
            <p className="mb-5 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Heart programs on the browse page to save them here.
            </p>
            <Link href="/mentorship-programs" className="btn-primary">Browse Programs</Link>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
