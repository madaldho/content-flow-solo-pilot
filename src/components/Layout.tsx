import React from "react";
import { Header } from "@/components/Header";

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export function Layout({ children, onSearch }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header onSearch={onSearch} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 