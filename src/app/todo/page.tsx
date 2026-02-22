"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Opportunity } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OpportunityCard from "@/components/OpportunityCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function TodoPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [favorites, setFavorites] = useState<Opportunity[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Listen to user's favorites subcollection
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const favQuery = query(collection(db, "users", user.uid, "favorites"));
    const unsubscribe = onSnapshot(favQuery, async (snapshot) => {
      const ids = snapshot.docs.map((d) => d.id);
      setFavoriteIds(new Set(ids));

      if (ids.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch each opportunity document
      const opps: Opportunity[] = [];
      await Promise.all(
        ids.map(async (id) => {
          try {
            const docSnap = await getDoc(doc(db, "opportunities", id));
            if (docSnap.exists()) {
              const data = docSnap.data();
              opps.push({
                id: docSnap.id,
                title: data.title,
                datePosted:
                  data.datePosted instanceof Timestamp
                    ? data.datePosted.toDate()
                    : new Date(data.datePosted),
                postedBy: data.postedBy,
                postedByName: data.postedByName || "Anonymous",
                anonymous: data.anonymous ?? false,
                expiresOn:
                  data.expiresOn instanceof Timestamp
                    ? data.expiresOn.toDate()
                    : new Date(data.expiresOn),
                typeTags: data.typeTags || [],
                fieldTags: data.fieldTags || [],
                yearTags: data.yearTags || [],
                contact: Array.isArray(data.contact) ? data.contact : (data.contact ? [data.contact] : []),
                description: data.description,
                approved: data.approved ?? true,
              });
            }
          } catch (e) {
            console.error("Error fetching opp:", e);
          }
        })
      );

      // Sort by date posted descending
      opps.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
      setFavorites(opps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleToggleFavorite = async (id: string) => {
    if (!user) return;
    const favRef = doc(db, "users", user.uid, "favorites", id);
    try {
      if (favoriteIds.has(id)) {
        await deleteDoc(favRef);
        toast.success("Removed from to-do list");
      } else {
        // Usually we only remove from this page
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
              Sign in to see your to-do list
            </h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Save opportunities you&apos;re interested in by pressing the heart icon.
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
            Your to-do list
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
          >
            Opportunities you&apos;ve saved for later
          </motion.p>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
            {loading ? (
              "Loading..."
            ) : (
              <>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">
                  {favorites.length}
                </span>{" "}
                saved {favorites.length === 1 ? "opportunity" : "opportunities"}
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
                <div className="flex gap-1.5">
                  <div className="h-5 w-16 rounded-md bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((opp, i) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                index={i}
                isFavorited
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
            <div className="mb-3 text-4xl">💛</div>
            <h3 className="mb-1 text-[15px] font-semibold text-text-primary dark:text-text-dark-primary">
              No saved opportunities
            </h3>
            <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Press the heart icon on any opportunity card to save it here.
            </p>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
