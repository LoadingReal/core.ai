"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/sidebar";

function MainContent() {
  return <div className="flex-1">Main Content</div>;
}

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex w-screen h-screen bg-background overflow-hidden">
      <Sidebar />
      <MainContent />
    </main>
  );
}
