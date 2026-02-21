export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border dark:border-border-dark">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <span className="text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
          Yale STEM Opportunities
        </span>
        <span className="text-[11px] text-text-tertiary/60 dark:text-text-dark-tertiary/60">
          &copy; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
