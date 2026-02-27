import { SubmitEvent, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { MoveRight } from "lucide-react";

export default function MainContent() {
  const { messages, sendMessage, isLoading } = useChatStore();
  const [chatMessage, setChatMessage] = useState<string>("");

  const handleSend = (e: SubmitEvent) => {
    e.preventDefault();
    sendMessage(chatMessage);
    setChatMessage("");
  };

  return (
    <div className="flex-1 relative">
      <div className="space-y-4 h-[90%] overflow-auto">
        <div className="flex max-w-200 mx-auto pb-24 ">
          <div className="min-w-8"></div>
          <div>
            {messages.map((message, index) => (
              <div key={index}>{message.content}</div>
            ))}
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSend}
        className="w-full bg-background absolute bottom-0 pb-2 mx-auto"
      >
        <div className="bg-linear-to-t from-background via-background/50 to-transparent h-20 w-full absolute -top-20 left-0 pointer-events-none"></div>
        <div className="relative mx-auto max-w-200 w-full">
          <input
            className="border shadow-md px-4 rounded-md bg-sidebar outline-0 p-2 w-full"
            name="chat-message"
            type="text"
            onChange={(e) => setChatMessage(e.target.value)}
            value={chatMessage}
            placeholder="Ask core.ai"
          />
          {/* <MoveRight className="absolute right-4 top-2.5" /> */}
          <p className="text-center text-muted-foreground mt-2 text-[11px]">
            core.ai can make mistakes
          </p>
        </div>
      </form>
    </div>
  );
}
