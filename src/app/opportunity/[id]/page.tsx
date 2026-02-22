"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Opportunity, AlumniEntry } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { isPast } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getTagColor } from "@/lib/tagColors";
import toast from "react-hot-toast";

const ET = "America/New_York";

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState<AlumniEntry[]>([]);
  const [alumniLoading, setAlumniLoading] = useState(true);
  const [togglingAlumni, setTogglingAlumni] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOpportunity = async () => {
      try {
        const docRef = doc(db, "opportunities", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOpportunity({
            id: docSnap.id,
            title: data.title,
            datePosted: data.datePosted instanceof Timestamp ? data.datePosted.toDate() : new Date(data.datePosted),
            postedBy: data.postedBy,
            postedByName: data.postedByName || "Anonymous",
            anonymous: data.anonymous ?? false,
            expiresOn: data.expiresOn instanceof Timestamp ? data.expiresOn.toDate() : new Date(data.expiresOn),
            typeTags: data.typeTags || [],
            fieldTags: data.fieldTags || [],
            yearTags: data.yearTags || [],
            contact: Array.isArray(data.contact) ? data.contact : (data.contact ? [data.contact] : []),
            description: data.description,
            approved: data.approved ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching opportunity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunity();
  }, [id]);

  // Alumni realtime listener
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "opportunities", id as string, "alumni"),
      orderBy("joinedAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setAlumni(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            name: data.name,
            email: data.email,
            photoURL: data.photoURL || null,
            joinedAt: data.joinedAt instanceof Timestamp ? data.joinedAt.toDate() : new Date(data.joinedAt),
          };
        })
      );
      setAlumniLoading(false);
    });
    return () => unsub();
  }, [id]);

  const isMeAlumni = !!user && alumni.some((a) => a.uid === user.uid);

  const handleToggleAlumni = async () => {
    if (!user) { toast.error("Sign in to join the alumni list"); return; }
    if (!id) return;
    setTogglingAlumni(true);
    try {
      const ref = doc(db, "opportunities", id as string, "alumni", user.uid);
      if (isMeAlumni) {
        await deleteDoc(ref);
        toast.success("Removed from alumni list");
      } else {
        await setDoc(ref, {
          name: user.displayName || user.email || "Anonymous",
          email: user.email || "",
          photoURL: user.photoURL || null,
          joinedAt: Timestamp.now(),
        });
        toast.success("Added to alumni list! 🎉");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setTogglingAlumni(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 lg:px-10">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-12 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
            <div className="h-8 w-2/3 rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-md bg-surface-tertiary dark:bg-surface-dark-tertiary" />
              <div className="h-6 w-16 rounded-md bg-surface-tertiary dark:bg-surface-dark-tertiary" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
              <div className="h-4 w-5/6 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
              <div className="h-4 w-3/4 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-3 text-4xl">🤷</div>
            <h2 className="mb-1 text-lg font-bold text-text-primary dark:text-text-dark-primary">Not found</h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">This opportunity doesn&apos;t exist or has been removed.</p>
            <button onClick={() => router.push("/")} className="btn-primary">Back to Home</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isExpired = isPast(new Date(opportunity.expiresOn));

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-1.5 text-[13px] text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>

          {/* Expired banner */}
          {isExpired && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              This opportunity has expired.
            </div>
          )}

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {opportunity.typeTags.map((tag) => (
              <span key={tag} className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${getTagColor(tag).pill}`}>
                {tag}
              </span>
            ))}
            {opportunity.fieldTags.map((tag) => (
              <span key={tag} className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${getTagColor(tag).pill}`}>
                {tag}
              </span>
            ))}
            {opportunity.yearTags.map((tag) => (
              <span key={tag} className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${getTagColor(tag).pill}`}>
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="mb-8 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary md:text-3xl">
            {opportunity.title}
          </h1>

          {/* Meta */}
          <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border dark:border-border-dark dark:bg-border-dark sm:grid-cols-4">
            {[
              { label: "Posted", value: formatInTimeZone(new Date(opportunity.datePosted), ET, "MMM d, yyyy") },
              { label: "Expires", value: formatInTimeZone(new Date(opportunity.expiresOn), ET, "MMM d, yyyy"), warn: isExpired },
              { label: "Contact", value: opportunity.contact.join(", ") },
              { label: "Posted by", value: opportunity.anonymous ? "Anonymous" : opportunity.postedByName },
            ].map((item) => (
              <div key={item.label} className="bg-white p-4 dark:bg-surface-dark-secondary">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary dark:text-text-dark-tertiary">
                  {item.label}
                </p>
                <p className={`text-[13px] font-medium ${item.warn ? "text-red-500 dark:text-red-400" : "text-text-primary dark:text-text-dark-primary"}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary dark:text-text-dark-tertiary">
              Description
            </p>
            <div className="whitespace-pre-wrap text-[14px] leading-[1.75] text-text-secondary dark:text-text-dark-secondary">
              {opportunity.description}
            </div>
          </div>

          {/* CTA */}
          {!isExpired && (
            <div className="rounded-2xl border border-border p-5 dark:border-border-dark">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-text-primary dark:text-text-dark-primary">Interested?</p>
                  <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">Reach out to:</p>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {opportunity.contact.map((c, i) => (
                      <span key={i} className="text-[13px] font-medium text-text-primary dark:text-text-dark-primary">{c}</span>
                    ))}
                  </div>
                </div>
                {opportunity.contact.some(c => c.includes("@")) && (
                  <div className="flex shrink-0 flex-col gap-2">
                    {opportunity.contact.filter(c => c.includes("@")).map((email, i) => (
                      <a key={i} href={`mailto:${email}`} className="btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                        </svg>
                        {email}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alumni Section */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary dark:text-text-dark-tertiary">
                  Yalies who did this
                </p>
                {!alumniLoading && alumni.length > 0 && (
                  <p className="mt-0.5 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                    {alumni.length} {alumni.length === 1 ? "person" : "people"}
                  </p>
                )}
              </div>
              <button
                onClick={handleToggleAlumni}
                disabled={togglingAlumni}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 disabled:opacity-50 ${
                  isMeAlumni
                    ? "bg-surface-secondary text-text-secondary hover:bg-red-50 hover:text-red-500 dark:bg-surface-dark-secondary dark:text-text-dark-secondary dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    : "border border-border text-text-secondary hover:border-black/20 hover:text-text-primary dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15 dark:hover:text-text-dark-primary"
                }`}
              >
                {isMeAlumni ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    Remove me
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                    I did this!
                  </>
                )}
              </button>
            </div>

            {alumniLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl border border-border p-3 dark:border-border-dark">
                    <div className="h-8 w-8 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-1/3 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                      <div className="h-3 w-1/2 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : alumni.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center dark:border-border-dark">
                <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                  No one has added themselves yet.{" "}
                  {user ? (
                    <button onClick={handleToggleAlumni} className="font-medium underline underline-offset-2 hover:no-underline">
                      Be the first!
                    </button>
                  ) : (
                    "Sign in to be the first!"
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {alumni.map((entry) => (
                    <motion.div
                      key={entry.uid}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 rounded-xl border border-border p-3 dark:border-border-dark"
                    >
                      {entry.photoURL ? (
                        <img
                          src={entry.photoURL}
                          alt={entry.name}
                          className="h-8 w-8 shrink-0 rounded-full ring-1 ring-border dark:ring-border-dark"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-[11px] font-bold text-text-secondary dark:bg-surface-dark-tertiary dark:text-text-dark-secondary">
                          {entry.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-text-primary dark:text-text-dark-primary">
                          {entry.name}
                          {user && entry.uid === user.uid && (
                            <span className="ml-1.5 text-[11px] font-normal text-text-tertiary dark:text-text-dark-tertiary">(you)</span>
                          )}
                        </p>
                        <a
                          href={`mailto:${entry.email}`}
                          className="truncate text-[12px] text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
                        >
                          {entry.email}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
