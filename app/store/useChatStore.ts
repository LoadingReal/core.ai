import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Chat, ChatStoreState, Message } from "../types/messages";

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,
      isLoading: false,

      createChat: () => {
        const id = crypto.randomUUID();
        const newChat: Chat = {
          id,
          title: "New Chat",
          messages: [],
          createdAt: Date.now(),
        };
        set((state) => ({
          chats: { ...state.chats, [id]: newChat },
          currentChatId: id,
        }));
        return id;
      },

      switchChat: (id) => set({ currentChatId: id }),

      deleteChat: (id: string) =>
        set((state) => {
          const newChats = { ...state.chats };
          delete newChats[id];
          return {
            chats: newChats,
            currentChatId:
              state.currentChatId === id ? null : state.currentChatId,
          };
        }),

      sendMessage: async (content: string) => {
        const { currentChatId, chats } = get();
        // If no chat exists, create one first
        let activeId = currentChatId;
        if (!activeId) {
          activeId = get().createChat();
        }

        const userMessage: Message = { role: "user", content };

        set((state) => ({
          isLoading: true,
          chats: {
            ...state.chats,
            [activeId!]: {
              ...state.chats[activeId!],
              messages: [
                ...state.chats[activeId!].messages,
                userMessage,
                { role: "assistant", content: "" },
              ],
            },
          },
        }));

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // Send history for the active chat
              messages: get().chats[activeId!].messages.slice(0, -1),
            }),
          });

          if (!response.ok) throw new Error("Failed to fetch AI");
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = "";

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              accumulatedContent += decoder.decode(value, { stream: true });

              set((state) => {
                const chat = state.chats[activeId!];
                const newMessages = [...chat.messages];
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: accumulatedContent,
                };
                return {
                  chats: {
                    ...state.chats,
                    [activeId!]: { ...chat, messages: newMessages },
                  },
                };
              });
            }
          }
          set({ isLoading: false });
        } catch (err) {
          console.error("Chat Error: ", err);
          set({ isLoading: false });
        }
      },
    }),
    { name: "chat-history-storage" },
  ),
);
