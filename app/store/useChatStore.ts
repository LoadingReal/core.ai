import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatStoreState, Message } from "../types/messages";

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      sendMessage: async (content: string) => {
        const userMessage: Message = { role: "user", content };

        set((state) => ({
          messages: [
            ...state.messages,
            userMessage,
            { role: "assistant", content: "" },
          ],
          isLoading: true,
        }));

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: get().messages.slice(0, -1),
            }),
          });

          if (!response.ok) throw new Error("Failed to fetch AI");
          if (!response.body) throw new Error("No response body");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;

            set((state) => {
              const newMessages = [...state.messages];
              const lastIndex = newMessages.length - 1;
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: accumulatedContent,
              };
              return { messages: newMessages };
            });
          }

          set({ isLoading: false });
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
