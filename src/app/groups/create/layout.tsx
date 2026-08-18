import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New group",
  description: "Start a group to split expenses with friends, family, or flatmates.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
