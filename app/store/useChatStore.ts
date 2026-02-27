import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatStoreState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      sendMessage: async (content: string) => {
        const userMessage: Message = { role: "user", content };
        set((state) => ({
          messages: [...state.messages, userMessage],
          isLoading: true,
        }));

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [...get().messages],
            }),
          });

          if (!response.ok) throw new Error("Failed to fetch AI");

          const aiData = await response.json();

          set((state) => ({
            messages: [...state.messages, aiData],
            isLoading: false,
          }));
        } catch (err) {
          console.error("Chat Error: ", err);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "chat-history-storage",
    },
  ),
);
