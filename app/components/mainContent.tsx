import { SubmitEvent, useState } from "react";
import { useChatStore } from "../store/useChatStore";

export default function MainContent() {
  const { messages, sendMessage, isLoading } = useChatStore();
  const [chatMessage, setChatMessage] = useState<string>("");

  const handleSend = (e: SubmitEvent) => {
    e.preventDefault();
    sendMessage(chatMessage);
    setChatMessage("");
  };

  return (
    <div className="flex-1">
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message.content}</div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          className="border"
          type="text"
          onChange={(e) => setChatMessage(e.target.value)}
          value={chatMessage}
        />
      </form>
    </div>
  );
}
