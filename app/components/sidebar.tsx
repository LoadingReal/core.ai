"use client";

import { ChevronLeft, MessageCirclePlus, Search } from "lucide-react";
import Logo from "./logo";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSidebarState } from "../store/useSidebar";

function SidebarOptions() {
  const { isOpen } = useSidebarState();

  const sidebarMenu = [
    { icon: MessageCirclePlus, title: "New chat" },
    { icon: Search, title: "Search chats" },
  ];

  return (
    <div className="text-sm">
      {sidebarMenu.map((item, index) => (
        <div
          key={index}
          className={`
              flex items-center overflow-hidden duration-100 transition-colors py-0.5 cursor-pointer
              ${isOpen && "hover:bg-white/5 rounded-md"}
            `}
        >
          <div className="flex">
            <item.icon
              className={`
                  size-8 shrink-0 p-1.5 opacity-80 duration-100 transition-colors
                  ${!isOpen && "hover:bg-white/10 rounded-md"}
                `}
            />
          </div>
          <span className="shrink-0 sidebar-menu-items">{item.title}</span>
        </div>
      ))}
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
      className="flex gap-2 mt-auto p-3 border rounded-md hover:bg-white/5 transition-colors duration-100"
    >
      <div className="w-6 h-6 bg-neutral-500 shrink-0 pointer-events-none text-white rounded-full text-center">
        G
      </div>
      <span className="sidebar-username">Guest</span>
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
            className={`cursor-pointer sidebar-arrow p-1.5 size-8 opacity-50 hover:bg-white/20 rounded-md transition-colors absolute duration-100`}
          />
        </div>
        <SidebarOptions />
      </div>
      <SidebarProfile />
    </div>
  );
}
