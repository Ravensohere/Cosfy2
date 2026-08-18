import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New budget",
  description: "Set a monthly, weekly, or category budget.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
