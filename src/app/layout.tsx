import type { Metadata } from "next";
import "./globals.css";

// No web fonts: everything works offline with system fonts.
export const metadata: Metadata = {
  title: "Grace — Scripture Display",
  description: "Live scripture display for the church media team",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
