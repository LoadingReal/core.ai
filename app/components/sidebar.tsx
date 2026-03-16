"use client";

import { ChevronLeft, MessageCirclePlus, Search, Trash2 } from "lucide-react";
import Logo from "./logo";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSidebarState } from "../store/useSidebar";
import { useChatStore } from "../store/useChatStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

function SidebarOptions() {
  const { isOpen } = useSidebarState();

  return (
    <div className="text-sm">
      {/* New Chat Link */}
      <Link
        href="/"
        className={`
          flex items-center overflow-hidden duration-100 transition-colors py-0.5 cursor-pointer
          ${isOpen && "hover:bg-black/5 dark:hover:bg-white/5 rounded-md"}
        `}
      >
        <div className="flex">
          <MessageCirclePlus
            className={`
                size-8 shrink-0 p-1.5 opacity-80 duration-100 transition-colors
                ${!isOpen && "hover:bg-black/10 dark:hover:bg-white/10 rounded-md"}
              `}
          />
        </div>
        <span className="shrink-0 sidebar-menu-items">New chat</span>
      </Link>

      {/* Search Option */}
      <div
        className={`flex items-center overflow-hidden duration-100 transition-colors py-0.5 cursor-pointer ${isOpen && "hover:bg-black/5 dark:hover:bg-white/5 rounded-md"}`}
      >
        <div className="flex">
          <Search
            className={`size-8 shrink-0 p-1.5 opacity-80 duration-100 transition-colors ${!isOpen && "hover:bg-black/10 dark:hover:bg-white/10 rounded-md"}`}
          />
        </div>
        <span className="shrink-0 sidebar-menu-items">Search chats</span>
      </div>
    </div>
  );
}

function SidebarChats() {
  const router = useRouter();
  const scope = useRef<HTMLDivElement>(null);
  const { chats, currentChatId, deleteChat } = useChatStore();
  const { isOpen } = useSidebarState();

  // Sort chats by date (newest first)
  const sortedChats = Object.values(chats).sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  useGSAP(
    () => {
      gsap.to(".sidebar-menu-items", {
        opacity: isOpen ? 1 : 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
    },
    { scope, dependencies: [isOpen] },
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      deleteChat(id);
      if (currentChatId === id) {
        router.push("/");
      }
    }
  };

  return (
    <div
      ref={scope}
      className="flex-1 overflow-y-auto mt-4 space-y-1 overflow-x-hidden shrink-0"
    >
      <p className="text-sm px-1 mb-2 font-bold text-muted-foreground sidebar-menu-items">
        Recent
      </p>

      {sortedChats.length > 0 ? (
        sortedChats.map((chat) => (
          <div key={chat.id} className="relative m-0 group/chat">
            <Link
              href={`/chat/${chat.id}`}
              className={`
              flex items-center px-1 py-2 rounded-md transition-colors text-sm
              ${currentChatId === chat.id ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"}
              ${!isOpen && "bg-transparent! pointer-events-none"}
            `}
            >
              <span className="truncate px-2 sidebar-menu-items">
                {chat.messages[0]?.content || "Empty Chat"}
              </span>
            </Link>

            {isOpen && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/chat:opacity-100 transition-opacity flex items-center">
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded-md transition-colors"
                  title="Delete chat"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <span className="px-3 text-sm text-muted-foreground/50 sidebar-menu-items text-nowrap">
          No recent chats
        </span>
      )}
    </div>
  );
}

function SidebarProfile() {
  const scope = useRef<HTMLDivElement>(null);
  const { isOpen } = useSidebarState();

  useGSAP(
    () => {
      gsap.to(".sidebar-username", {
        opacity: isOpen ? 1 : 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
    },
    { scope, dependencies: [isOpen] },
  );

  return (
    <div
      ref={scope}
      className="flex gap-3 mt-auto p-3 border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-100"
    >
      <div className="pointer-events-none select-none w-6 h-6 bg-neutral-500 shrink-0 text-white rounded-full text-center">
        G
      </div>
      <span className="pointer-events-none select-none sidebar-username">
        Guest
      </span>
    </div>
  );
}

export default function Sidebar() {
  const [isHydrated, setIsHydrated] = useState(false);

  const { isOpen, toggle } = useSidebarState();
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useGSAP(
    () => {
      if (!isHydrated) return;

      const tl = gsap.timeline({
        defaults: {
          duration: isFirstRender.current ? 0 : 0.3,
          ease: "power2.out",
        },
      });

      tl.to(containerRef.current, { width: isOpen ? 256 : 49 }, 0)
        .to(".sidebar-logo", { opacity: isOpen ? 1 : 0 }, 0)
        .to(
          ".sidebar-arrow",
          { right: isOpen ? 0 : 0, rotate: isOpen ? 0 : 180 },
          0,
        )
        .to(".sidebar-menu-items", { opacity: isOpen ? 1 : 0 }, 0);

      isFirstRender.current = false;
    },
    { dependencies: [isOpen, isHydrated], scope: containerRef },
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <div
      className={`
        relative bg-sidebar h-screen flex flex-col shrink-0 overflow-hidden
        ${isOpen ? "w-64" : "w-16"} 
      `}
      ref={containerRef}
    >
      <div className="p-2 pt-2.5">
        <div className="relative flex justify-between items-center mb-3">
          <div className="sidebar-logo">
            <Logo />
          </div>
          <ChevronLeft
            onClick={toggle}
            className={`cursor-pointer sidebar-arrow p-1.5 size-8 opacity-50 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors absolute duration-100`}
          />
        </div>
        <SidebarOptions />
        <SidebarChats />
      </div>
      <SidebarProfile />
    </div>
  );
}
