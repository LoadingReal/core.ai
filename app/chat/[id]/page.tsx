"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/app/store/useChatStore";
import MainContent from "@/app/components/mainContent";
import Sidebar from "@/app/components/sidebar";

export const runtime = "edge";

export default function ChatPage() {
  const { id } = useParams();
  const switchChat = useChatStore((state) => state.switchChat);

  useEffect(() => {
    if (id) {
      switchChat(id as string);
    }
  }, [id, switchChat]);

  return (
    <main className="flex w-screen h-dvh bg-background overflow-hidden">
      <Sidebar />
      <MainContent />
    </main>
  );
}
