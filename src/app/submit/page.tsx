"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { TYPE_TAGS, FIELD_TAGS, YEAR_TAGS, TypeTag, FieldTag, YearTag } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SubmitPage() {
  const { user, signIn } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    contact: "",
    expiresOn: "",
    typeTags: [] as TypeTag[],
    fieldTags: [] as FieldTag[],
    yearTags: [] as YearTag[],
  });

  const toggleTag = <T extends string>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((t) => t !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in first"); return; }
    if (!form.title || !form.description || !form.contact || !form.expiresOn) {
      toast.error("Please fill in all required fields"); return;
    }
    if (form.typeTags.length === 0) { toast.error("Select at least one type"); return; }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "opportunities"), {
        title: form.title,
        description: form.description,
        contact: form.contact,
        expiresOn: Timestamp.fromDate(new Date(form.expiresOn + "T23:59:59-05:00")),
        typeTags: form.typeTags,
        fieldTags: form.fieldTags,
        yearTags: form.yearTags,
        datePosted: Timestamp.now(),
        postedBy: user.uid,
        postedByName: anonymous ? "Anonymous" : (user.displayName || user.email || "Anonymous"),
        anonymous: anonymous,
        approved: true,
      });
      toast.success("Posted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-5 text-5xl">✍️</div>
            <h2 className="mb-2 text-xl font-bold text-text-primary dark:text-text-dark-primary">
              Sign in to post
            </h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              You need to be signed in to share opportunities.
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1.5 text-[13px] text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>

          <h1 className="mb-1 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary">
            Post an opportunity
          </h1>
          <p className="mb-8 text-[14px] text-text-tertiary dark:text-text-dark-tertiary">
            Share a STEM opportunity with the Yale community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Summer Research Assistant — Yale School of Medicine"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the opportunity, requirements, and expectations..."
                rows={5}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Type <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(form.typeTags, tag, (v) => setForm({ ...form, typeTags: v }))}
                    className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                      form.typeTags.includes(tag)
                        ? getTagColor(tag).active
                        : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Academic Fields
              </label>
              <div className="flex flex-wrap gap-2">
                {FIELD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(form.fieldTags, tag, (v) => setForm({ ...form, fieldTags: v }))}
                    className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                      form.fieldTags.includes(tag)
                        ? getTagColor(tag).active
                        : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                School Year
              </label>
              <div className="flex flex-wrap gap-2">
                {YEAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(form.yearTags, tag, (v) => setForm({ ...form, yearTags: v }))}
                    className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                      form.yearTags.includes(tag)
                        ? getTagColor(tag).active
                        : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                  Expires On <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.expiresOn}
                  onChange={(e) => setForm({ ...form, expiresOn: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                  Contact <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="Email or name"
                  className="input-field"
                />
              </div>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAnonymous(!anonymous)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  anonymous ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-black ${
                    anonymous ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <label className="text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Post anonymously
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-6 dark:border-border-dark">
              <p className="text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
                Posting as{" "}
                <span className="font-medium text-text-secondary dark:text-text-dark-secondary">
                  {anonymous ? "Anonymous" : (user.displayName || user.email)}
                </span>
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
                    Posting...
                  </span>
                ) : (
                  "Post Opportunity"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
