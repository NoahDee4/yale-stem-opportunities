"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, loading, signIn, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl dark:border-border-dark dark:bg-surface-dark/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-[15px] font-semibold tracking-tight text-text-primary transition-opacity duration-150 group-hover:opacity-70 dark:text-text-dark-primary">
            Yale Stem Opportunities
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/" className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary">
            Browse
          </Link>
          {user && (
            <>
              <Link href="/submit" className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary">
                Post
              </Link>
              <Link href="/my-posts" className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary">
                Your Posts
              </Link>
              <Link href="/todo" className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary">
                <span className="flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  To-Do
                </span>
              </Link>
            </>
          )}

          <div className="mx-1.5 h-4 w-px bg-border dark:bg-border-dark" />

          <button
            onClick={toggle}
            className="rounded-lg p-2 text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
          >
            {theme === "light" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            )}
          </button>

          <div className="mx-1.5 h-4 w-px bg-border dark:bg-border-dark" />

          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary" />
          ) : user ? (
            <div className="flex items-center gap-2.5">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full ring-1 ring-border dark:ring-border-dark" />
              )}
              <span className="text-[13px] font-medium text-text-primary dark:text-text-dark-primary">
                {user.displayName?.split(" ")[0]}
              </span>
              <button onClick={signOut} className="rounded-lg px-2.5 py-1 text-[12px] font-medium text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary">
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={signIn} className="btn-primary !py-2 !text-[13px]">
              Sign in
            </button>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <button onClick={toggle} className="rounded-lg p-2 text-text-tertiary dark:text-text-dark-tertiary">
            {theme === "light" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            )}
          </button>
          <button className="rounded-lg p-2 text-text-secondary dark:text-text-dark-secondary" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-border dark:border-border-dark md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-3">
              <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">Browse</Link>
              {user && <Link href="/submit" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">Post</Link>}
              {user && <Link href="/my-posts" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">Your Posts</Link>}
              {user && (
                <Link href="/todo" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="text-red-400">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    To-Do
                  </span>
                </Link>
              )}
              <div className="my-1 h-px bg-border dark:bg-border-dark" />
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    {user.photoURL && <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full" />}
                    <span className="text-[13px] font-medium dark:text-text-dark-primary">{user.displayName}</span>
                  </div>
                  <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-[12px] font-medium text-text-tertiary dark:text-text-dark-tertiary">Sign out</button>
                </div>
              ) : (
                <button onClick={() => { signIn(); setMenuOpen(false); }} className="btn-primary mx-3 my-2">Sign in with Google</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
