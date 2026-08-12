import type { Metadata } from "next";
import { Poppins, Hanken_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * Stand-in for TT Norms Pro (commercial licence, not redistributable).
 * To swap it in: self-host the woff2 with next/font/local and point
 * --font-hanken at it — nothing else in the codebase changes.
 */
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dential Lab — Le cas implantaire complet, en un seul endroit",
  description:
    "Un flux numérique sans couture pour les praticiens exigeants au Maroc : planification implanto-prothétique, guide chirurgical imprimé, trousse de chirurgie guidée prêtée, composants d'origine et couronne finale en zircone.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
