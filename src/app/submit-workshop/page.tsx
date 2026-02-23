"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { FIELD_TAGS, WORKSHOP_FORMATS, FieldTag, WorkshopFormat } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SubmitWorkshopPage() {
  const { user, signIn } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    eventTime: "",
    format: "" as WorkshopFormat | "",
    fieldTags: [] as FieldTag[],
    contacts: [""],
  });

  const toggleField = (tag: FieldTag) =>
    setForm({ ...form, fieldTags: form.fieldTags.includes(tag) ? form.fieldTags.filter((t) => t !== tag) : [...form.fieldTags, tag] });

  const addContact = () => setForm({ ...form, contacts: [...form.contacts, ""] });
  const removeContact = (i: number) => setForm({ ...form, contacts: form.contacts.filter((_, idx) => idx !== i) });
  const updateContact = (i: number, val: string) => {
    const contacts = [...form.contacts];
    contacts[i] = val;
    setForm({ ...form, contacts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in first"); return; }
    if (!form.title || !form.description || !form.location || !form.eventDate || !form.eventTime || !form.format) {
      toast.error("Please fill in all required fields"); return;
    }
    if (form.contacts.every((c) => !c.trim())) { toast.error("Add at least one contact"); return; }

    setSubmitting(true);
    try {
      const eventDatetime = new Date(`${form.eventDate}T${form.eventTime}:00`);
      await addDoc(collection(db, "workshops"), {
        title: form.title,
        description: form.description,
        location: form.location,
        eventDate: Timestamp.fromDate(eventDatetime),
        format: form.format,
        fieldTags: form.fieldTags,
        contact: form.contacts.filter((c) => c.trim()),
        datePosted: Timestamp.now(),
        postedBy: user.uid,
        postedByName: anonymous ? "Anonymous" : (user.displayName || user.email || "Anonymous"),
        anonymous,
      });
      toast.success("Workshop posted!");
      router.push("/workshops");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post. Try again.");
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
            <div className="mx-auto mb-5 text-5xl">🎓</div>
            <h2 className="mb-2 text-xl font-bold text-text-primary dark:text-text-dark-primary">Sign in to post</h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">You need to be signed in to share workshops.</p>
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

          <h1 className="mb-1 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary">Post a Workshop</h1>
          <p className="mb-8 text-[14px] text-text-tertiary dark:text-text-dark-tertiary">Share a STEM workshop or event with the Yale community.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Intro to CRISPR — Yale Biology Dept."
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
                placeholder="What will attendees learn? Who is it for?"
                rows={4}
                className="input-field resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Kline Biology Tower Rm 101 or Zoom link"
                className="input-field"
              />
            </div>

            {/* Date + Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                  Event Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                  Event Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={form.eventTime}
                  onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Format <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {WORKSHOP_FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm({ ...form, format: f })}
                    className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                      form.format === f
                        ? getTagColor(f).active
                        : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Fields */}
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

            {/* Contact */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                Point of Contact <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {form.contacts.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => updateContact(i, e.target.value)}
                      placeholder="Email or name"
                      className="input-field flex-1"
                    />
                    {form.contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(i)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-text-tertiary transition-colors hover:border-red-300 hover:text-red-500 dark:border-border-dark dark:text-text-dark-tertiary dark:hover:border-red-700 dark:hover:text-red-400"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                  Add another contact
                </button>
              </div>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAnonymous(!anonymous)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  anonymous ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 dark:bg-black ${anonymous ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <label className="text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">Post anonymously</label>
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
                ) : "Post Workshop"}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
