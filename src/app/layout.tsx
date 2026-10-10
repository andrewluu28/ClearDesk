import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearDesk — turn clutter into a plan",
  description:
    "Upload a photo of your desk and get a practical, prioritized organization plan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
