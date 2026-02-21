"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Opportunity } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { isPast } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getTagColor } from "@/lib/tagColors";

const ET = "America/New_York";

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

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
            expiresOn: data.expiresOn instanceof Timestamp ? data.expiresOn.toDate() : new Date(data.expiresOn),
            typeTags: data.typeTags || [],
            fieldTags: data.fieldTags || [],
            contact: data.contact,
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
              { label: "Contact", value: opportunity.contact },
              { label: "Posted by", value: opportunity.postedByName },
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
                  <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                    Reach out to <span className="font-medium text-text-primary dark:text-text-dark-primary">{opportunity.contact}</span>
                  </p>
                </div>
                {opportunity.contact.includes("@") && (
                  <a href={`mailto:${opportunity.contact}`} className="btn-primary shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                    </svg>
                    Send Email
                  </a>
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
