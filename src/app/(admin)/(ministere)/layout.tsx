import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ministères",
    description: "Ministères",
}

export default function MinistereLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  }