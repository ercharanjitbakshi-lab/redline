import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";

const documentSerif = Source_Serif_4({
  variable: "--font-document",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Redline",
  description:
    "Redline reviews a freelance contract before you sign it and drafts the counter-offer you can send back.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={documentSerif.variable}>
      <body>{children}</body>
    </html>
  );
}
