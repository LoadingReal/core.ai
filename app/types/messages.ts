export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ChatStoreState {
  chats: Record<string, Chat>; // Using a Record for O(1) lookups
  currentChatId: string | null;
  isLoading: boolean;
  // Actions
  createChat: () => string;
  switchChat: (id: string | null) => void;
  deleteChat: (id: string) => void;
  sendMessage: (content: string, chatId?: string) => Promise<void>;
}
