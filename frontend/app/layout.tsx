import type { Metadata } from "next";
import ThemeProvider from "./providers/ThemeProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import "./animations.css";

export const metadata: Metadata = {
  title: "Todo",
  description: "A simple place for your tasks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}