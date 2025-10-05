import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      <ThemeProvider>
        <div className="w-full min-h-screen">
          {children}
        </div>
      </ThemeProvider>
    </div>
  );
}
