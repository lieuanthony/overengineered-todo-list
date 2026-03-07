import type { Metadata } from "next";
import ThemeProvider from "./providers/ThemeProvider";
import AuthProvider from "./providers/AuthProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CssBaseline from "@mui/material/CssBaseline";
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
          <AuthProvider>
            <CssBaseline />
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Navbar />
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}