import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yale STEM Opportunities",
  description:
    "Discover and share STEM opportunities within the Yale community — internships, research, fellowships, workshops, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white transition-colors duration-300 dark:bg-[#0a0a0a]">
        <ThemeProvider>
          <AuthProvider>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  fontFamily: "Inter, system-ui, sans-serif",
                  borderRadius: "12px",
                  background: "#0a0a0a",
                  color: "#fff",
                  fontSize: "13px",
                  padding: "12px 16px",
                },
              }}
            />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
