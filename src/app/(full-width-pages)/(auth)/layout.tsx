import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen bg-white dark:bg-gray-900">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-full">
          {children}
        </div>
      </ThemeProvider>
    </div>
  );
}
