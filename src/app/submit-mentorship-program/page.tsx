"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FieldTag, FIELD_TAGS } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SubmitMentorshipProgramPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    fieldTags: [] as FieldTag[],
    contact: "",
    anonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleField = (tag: FieldTag) =>
    setForm((f) => ({
      ...f,
      fieldTags: f.fieldTags.includes(tag)
        ? f.fieldTags.filter((t) => t !== tag)
        : [...f.fieldTags, tag],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to post"); return; }
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    if (!form.link.trim()) { toast.error("Program link is required"); return; }

    // Basic URL validation
    try {
      new URL(form.link.trim().startsWith("http") ? form.link.trim() : `https://${form.link.trim()}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setSubmitting(true);
    try {
      const link = form.link.trim().startsWith("http") ? form.link.trim() : `https://${form.link.trim()}`;
      await addDoc(collection(db, "mentorshipPrograms"), {
        title: form.title.trim(),
        description: form.description.trim(),
        link,
        fieldTags: form.fieldTags,
        contact: form.contact.trim(),
        anonymous: form.anonymous,
        datePosted: Timestamp.fromDate(new Date()),
        postedBy: user.uid,
        postedByName: user.displayName || "Anonymous",
      });
      toast.success("Program posted! 🎉");
      router.push("/mentorship-programs");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-5 text-5xl">🔒</div>
            <h2 className="mb-2 text-xl font-bold text-text-primary dark:text-text-dark-primary">Sign in to post</h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              You need to be signed in to share a mentorship program.
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary md:text-3xl">
            Post a Mentorship Program
          </h1>
          <p className="mb-8 text-[15px] text-text-tertiary dark:text-text-dark-tertiary">
            Share a link to an existing mentorship program with the Yale community
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Program Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Yale Summer Fellows Program"
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Describe what this program offers, who it's for, how to apply, etc."
                className="input-field resize-none"
              />
            </div>

            {/* Link */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Program Link <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://program-website.com"
                className="input-field"
              />
              <p className="mt-1 text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
                Link to the official program page or application
              </p>
            </div>

            {/* Field tags */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Academic Fields
              </label>
              <div className="flex flex-wrap gap-2">
                {FIELD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleField(tag)}
                    className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
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

            {/* Contact */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Contact
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Email or name for questions"
                className="input-field"
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border p-4 dark:border-border-dark">
              <div>
                <p className="text-[13px] font-medium text-text-primary dark:text-text-dark-primary">Post anonymously</p>
                <p className="text-[12px] text-text-tertiary dark:text-text-dark-tertiary">Your name won't be shown on the card</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${form.anonymous ? "bg-black dark:bg-white" : "bg-surface-tertiary dark:bg-surface-dark-tertiary"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 dark:bg-black ${form.anonymous ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-6 dark:border-border-dark">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                    </svg>
                    Posting...
                  </span>
                ) : (
                  "Post Program"
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
