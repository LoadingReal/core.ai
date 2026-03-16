"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/sidebar";
import MainContent from "./components/mainContent";
import { useChatStore } from "./store/useChatStore";

export default function Home() {
  const switchChat = useChatStore((state) => state.switchChat);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Clear active chat when hitting the landing page
    switchChat(null);
  }, [switchChat]);

  if (!mounted) return null;

  return (
    <main className="flex w-screen h-screen bg-background overflow-hidden">
      <Sidebar />
      <MainContent />
    </main>
  );
}
