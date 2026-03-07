import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import ThemeProvider from "./providers/ThemeProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import "./animations.css"

export const metadata: Metadata = {
  title: "Todo",
  description: "A simple place for your tasks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <Footer />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}