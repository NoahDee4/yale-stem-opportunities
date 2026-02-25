"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MentorshipProgram } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { getTagColor } from "@/lib/tagColors";

export default function MentorshipProgramDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<MentorshipProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "mentorshipPrograms", id as string));
        if (snap.exists()) {
          const d = snap.data();
          setProgram({
            id: snap.id,
            title: d.title,
            description: d.description,
            link: d.link,
            fieldTags: d.fieldTags || [],
            contact: d.contact || "",
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

  if (!program) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-3 text-4xl">🤷</div>
            <h2 className="mb-1 text-lg font-bold text-text-primary dark:text-text-dark-primary">Not found</h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              This program doesn&apos;t exist or has been removed.
            </p>
            <button onClick={() => router.push("/mentorship-programs")} className="btn-primary">
              Back to Programs
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const domain = (() => {
    try { return new URL(program.link).hostname.replace("www.", ""); }
    catch { return program.link; }
  })();

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

          {/* Tags */}
          {program.fieldTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {program.fieldTags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${getTagColor(tag).pill}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-8 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary md:text-3xl">
            {program.title}
          </h1>

          {/* Meta grid */}
          <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border dark:border-border-dark dark:bg-border-dark sm:grid-cols-3">
            {[
              { label: "Website", value: domain, href: program.link },
              {
                label: "Contact",
                value: program.contact || "—",
                href: program.contact?.includes("@") ? `mailto:${program.contact}` : undefined,
              },
              {
                label: "Posted by",
                value: program.anonymous ? "Anonymous" : program.postedByName,
              },
            ].map((item) => (
              <div key={item.label} className="bg-white p-4 dark:bg-surface-dark-secondary">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary dark:text-text-dark-tertiary">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="truncate text-[13px] font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-[13px] font-medium text-text-primary dark:text-text-dark-primary">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary dark:text-text-dark-tertiary">
              Description
            </p>
            <div className="whitespace-pre-wrap text-[14px] leading-[1.75] text-text-secondary dark:text-text-dark-secondary">
              {program.description}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-border p-5 dark:border-border-dark">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-semibold text-text-primary dark:text-text-dark-primary">
                  Ready to apply?
                </p>
                <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                  Visit the program&apos;s official page to learn more and apply.
                </p>
              </div>
              <a
                href={program.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shrink-0"
              >
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
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Visit {domain}
              </a>
            </div>
          </div>

          {/* Footer meta */}
          <p className="mt-6 text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
            Posted {formatDistanceToNow(new Date(program.datePosted), { addSuffix: true })}
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
