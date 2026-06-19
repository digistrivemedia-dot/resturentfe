import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthInitializer from "@/components/AuthInitializer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CafeSriisha - Food Delivery & Restaurant Management",
  description:
    "Order food from the best restaurants near you. Fast delivery, great taste.",
  keywords: "food delivery, restaurant, order food online, CafeSriisha",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthInitializer />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              fontSize: "var(--font-size-sm)",
            },
            success: {
              iconTheme: {
                primary: "var(--success)",
                secondary: "var(--text-inverse)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--error)",
                secondary: "var(--text-inverse)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
