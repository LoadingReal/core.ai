"use client";

import { ChevronLeft } from "lucide-react";
import Logo from "./logo";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    gsap.to(containerRef.current, {
      width: isOpen ? 256 : 46,
      duration: 0.3,
      ease: "power2.out",
    });

    gsap.to(logoRef.current, {
      duration: 0.3,
      opacity: isOpen ? 1 : 0,
      ease: "power2.out",
    });

    gsap.to(arrowRef.current, {
      rotate: isOpen ? 0 : 180,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [isOpen]);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`
        relative bg-sidebar border-r border-sidebar-border h-screen 
        flex flex-col shrink-0
        ${isOpen ? "w-64" : "w-16"}
      `}
      ref={containerRef}
    >
      <div className="flex justify-between items-center p-1.5">
        <div ref={logoRef}>
          <Logo />
        </div>
        <ChevronLeft
          ref={arrowRef}
          onClick={handleMenuClick}
          className="p-1.5 size-8 opacity-50 hover:bg-white/20 rounded-md transition-colors absolute right-1.5 durationn-100"
        />
      </div>
    </div>
  );
}
