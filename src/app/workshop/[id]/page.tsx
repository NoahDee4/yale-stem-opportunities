"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workshop } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { format, isPast } from "date-fns";
import { getTagColor } from "@/lib/tagColors";

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "workshops", id as string));
        if (snap.exists()) {
          const d = snap.data();
          setWorkshop({
            id: snap.id,
            title: d.title,
            description: d.description,
            location: d.location,
            eventDate:
              d.eventDate instanceof Timestamp
                ? d.eventDate.toDate()
                : new Date(d.eventDate),
            eventEndTime: d.eventEndTime
              ? d.eventEndTime instanceof Timestamp
                ? d.eventEndTime.toDate()
                : new Date(d.eventEndTime)
              : undefined,
            fieldTags: d.fieldTags || [],
            format: d.format,
            contact: Array.isArray(d.contact) ? d.contact : [d.contact].filter(Boolean),
            datePosted:
              d.datePosted instanceof Timestamp
                ? d.datePosted.toDate()
                : new Date(d.datePosted),
            postedBy: d.postedBy,
            postedByName: d.postedByName || "Anonymous",
            anonymous: d.anonymous ?? false,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

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

  if (!workshop) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-3 text-4xl">🤷</div>
            <h2 className="mb-1 text-lg font-bold text-text-primary dark:text-text-dark-primary">Not found</h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              This workshop doesn&apos;t exist or has been removed.
            </p>
            <button onClick={() => router.push("/workshops")} className="btn-primary">
              Back to Workshops
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const past = isPast(new Date(workshop.eventDate));
  const dateStr = format(new Date(workshop.eventDate), "EEEE, MMMM d, yyyy 'at' h:mm a");
  const endStr = workshop.eventEndTime
    ? format(new Date(workshop.eventEndTime), "h:mm a")
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-1.5 text-[13px] text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Past event banner */}
          {past && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
              This event has already taken place.
            </div>
          )}

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            <span className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${getTagColor(workshop.format).pill}`}>
              {workshop.format}
            </span>
            {workshop.fieldTags.map((tag) => (
              <span key={tag} className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${getTagColor(tag).pill}`}>
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="mb-8 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary md:text-3xl">
            {workshop.title}
          </h1>

          {/* Meta grid */}
          <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border dark:border-border-dark dark:bg-border-dark sm:grid-cols-4">
            {[
              {
                label: "Date & Time",
                value: `${dateStr}${endStr ? ` – ${endStr}` : ""}`,
                warn: past,
              },
              { label: "Location", value: workshop.location },
              {
                label: "Contact",
                value: workshop.contact.join(", ") || "—",
              },
              {
                label: "Posted by",
                value: workshop.anonymous ? "Anonymous" : workshop.postedByName,
              },
            ].map((item) => (
              <div key={item.label} className="bg-white p-4 dark:bg-surface-dark-secondary">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary dark:text-text-dark-tertiary">
                  {item.label}
                </p>
                <p
                  className={`text-[13px] font-medium ${
                    item.warn
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-text-primary dark:text-text-dark-primary"
                  }`}
                >
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
              {workshop.description}
            </div>
          </div>

          {/* CTA */}
          {!past && workshop.contact.length > 0 && (
            <div className="rounded-2xl border border-border p-5 dark:border-border-dark">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-text-primary dark:text-text-dark-primary">
                    Interested?
                  </p>
                  <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                    Reach out to:
                  </p>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {workshop.contact.map((c, i) => (
                      <span
                        key={i}
                        className="text-[13px] font-medium text-text-primary dark:text-text-dark-primary"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                {workshop.contact.some((c) => c.includes("@")) && (
                  <div className="flex shrink-0 flex-col gap-2">
                    {workshop.contact
                      .filter((c) => c.includes("@"))
                      .map((email, i) => (
                        <a key={i} href={`mailto:${email}`} className="btn-primary">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                          </svg>
                          {email}
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
