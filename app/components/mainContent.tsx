import {
  SubmitEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useChatStore } from "../store/useChatStore";
import { MoveRight } from "lucide-react";
import { Message } from "../types/messages";
import ReactMarkdown from "react-markdown";

function ChatSection({ messages }: { messages: Message[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const prevCountRef = useRef(messages.length);

  const hasInitialScrolled = useRef(false);

  const pendingScrollRef = useRef<{
    behavior: ScrollBehavior;
    targetIndex: number;
  } | null>(null);

  const updateLayout = (
    behavior: ScrollBehavior = "smooth",
    shouldScroll = false,
  ) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const messageElements = container.querySelectorAll(".message-item");

    if (messageElements.length > 0) {
      const containerHeight = container.clientHeight;
      const lastUserIndex = messages.findLastIndex((m) => m.role === "user");

      if (lastUserIndex !== -1) {
        const userMsgEl = messageElements[lastUserIndex] as HTMLElement;
        const lastMsgEl = messageElements[
          messageElements.length - 1
        ] as HTMLElement;

        const contentBottom = lastMsgEl.offsetTop + lastMsgEl.offsetHeight;
        const userTop = userMsgEl.offsetTop;

        const activeContentHeight = contentBottom - userTop + 74.5 + 64;

        const newHeight = Math.max(0, containerHeight - activeContentHeight);

        if (shouldScroll) {
          const lastMessage = messages[messages.length - 1];
          const lastUserIndex = messages.findLastIndex(
            (m) => m.role === "user",
          );
          const targetIndex =
            lastMessage?.role === "user"
              ? messageElements.length - 1
              : lastUserIndex;
          const targetEl = messageElements[targetIndex] as HTMLElement;

          if (targetEl) {
            requestAnimationFrame(() => {
              container.scrollTo({
                top: targetEl.offsetTop - 64,
                behavior: behavior,
              });
            });
          }
        }

        setSpacerHeight(newHeight);
      }
    }
  };

  useLayoutEffect(() => {
    if (pendingScrollRef.current && containerRef.current) {
      const { behavior, targetIndex } = pendingScrollRef.current;
      const messageElements =
        containerRef.current.querySelectorAll(".message-item");
      const targetEl = messageElements[targetIndex] as HTMLElement;

      if (targetEl) {
        requestAnimationFrame(() => {
          containerRef.current?.scrollTo({
            top: targetEl.offsetTop - 64,
            behavior: behavior,
          });
        });
      }
      pendingScrollRef.current = null;
    }
  }, [spacerHeight]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateLayout("instant", false);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [messages]);

  useLayoutEffect(() => {
    if (messages.length > 0 && !hasInitialScrolled.current) {
      updateLayout("instant", true);
      hasInitialScrolled.current = true;
    }
  }, [messages]);

  useLayoutEffect(() => {
    updateLayout("instant", false);
  }, [messages]);

  useEffect(() => {
    const isNewMessageAdded = messages.length > prevCountRef.current;

    if (isNewMessageAdded) {
      setTimeout(() => {
        updateLayout("smooth", true);
      }, 50);
    }

    prevCountRef.current = messages.length;
  }, [messages.length]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-200 mx-auto px-4 pb-12">
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-item p-3 leading-relaxed ${
                message.role === "assistant"
                  ? "text-foreground prose prose-neutral prose-pre:bg-sidebar prose-strong:text-primary prose-a:text-primary prose-code:text-primary dark:prose-neutral max-w-none"
                  : "bg-sidebar rounded-md max-w-120 w-fit ml-auto mt-16"
              }`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}

          <div style={{ height: `${spacerHeight}px`, width: "100%" }} />
        </div>
      </div>
    </div>
  );
}

export default function MainContent() {
  const { messages, sendMessage, isLoading } = useChatStore();
  const [chatMessage, setChatMessage] = useState<string>("");
  const editableRef = useRef<HTMLParagraphElement>(null);

  const handleSend = (e?: SubmitEvent) => {
    e?.preventDefault();
    sendMessage(chatMessage);
    setChatMessage("");

    if (editableRef.current) {
      editableRef.current.innerText = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
      <ChatSection messages={messages} />
      <form
        onSubmit={handleSend}
        className="w-full bg-background relative pb-2 mx-auto"
      >
        <div className="bg-linear-to-t from-background via-background/50 to-transparent h-16 w-full absolute -top-16 left-0 pointer-events-none"></div>
        <div className="relative mx-auto max-w-200 w-full">
          <p
            ref={editableRef}
            role="textbox"
            contentEditable
            className="border shadow-md px-4 rounded-md bg-sidebar outline-0 p-2 w-full"
            onInput={(e) => setChatMessage(e.currentTarget.innerText)}
            data-placeholder="Ask core.ai"
            onKeyDown={handleKeyDown}
          />
          {chatMessage.trim() === "" && (
            <span className="absolute left-4 top-2 text-muted-foreground/50 pointer-events-none">
              Ask core.ai
            </span>
          )}
          {/* <MoveRight className="absolute right-4 top-2.5" /> */}
          <p className="text-center text-muted-foreground mt-2 text-[11px]">
            core.ai can make mistakes
          </p>
        </div>
      </form>
    </div>
  );
}
