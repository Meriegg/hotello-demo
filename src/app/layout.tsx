import "~/styles/globals.css";

import { Merriweather } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { Navbar } from "~/components/navbar/navbar";

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["700", "900", "400", "300"],
});

export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-serif ${merriweather.variable}`}>
        <Toaster />

        <TRPCReactProvider headers={headers()}>
          <Navbar />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
