export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatStoreState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
}
