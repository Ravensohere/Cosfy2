import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AppLockGate } from "@/components/layout/AppLockGate";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Cosfy", template: "%s — Cosfy" },
  description: "Track spending, split bills, and build better money habits, built for India.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#C3E04A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ServiceWorkerRegister />
        <AppLockGate>
          <AppShell>{children}</AppShell>
        </AppLockGate>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              toast: "!rounded-card !border !border-cosfy-border !bg-cosfy-card !text-cosfy-ink !shadow-soft",
              title: "!text-[13px] !font-bold",
              description: "!text-[12px] !text-cosfy-muted",
            },
          }}
        />
      </body>
    </html>
  );
}
