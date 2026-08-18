import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax calculator",
  description: "Estimate your income tax under the old and new regimes.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
