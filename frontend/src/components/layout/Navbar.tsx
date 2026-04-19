"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Solar Flare", href: "/solar-flare" },
  { label: "CME", href: "/cme" },
  { label: "Solar Wind", href: "/solar-wind" },
  { label: "SEP", href: "/sep" },
  { label: "LLM", href: "/llm" },
];

export default function Navbar() {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] overflow-x-auto px-2 pb-4 scrollbar-none">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl min-w-max"
      >
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            title={item.label}
            href={item.href}
            mouseX={mouseX}
            active={pathname === item.href}
          />
        ))}
      </motion.div>
    </nav>
  );
}

function NavItem({
  mouseX,
  title,
  href,
  active,
}: {
  mouseX: MotionValue<number>;
  title: string;
  href: string;
  active: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (bounds.x + bounds.width / 2);
  });

  const hoverPhase = useSpring(
    useTransform(distance, [-150, 0, 150], [0, 1, 0]),
    { mass: 0.1, stiffness: 150, damping: 12 }
  );

  const width = useTransform(hoverPhase, [0, 1], ["5rem", "7.5rem"]);
  const height = useTransform(hoverPhase, [0, 1], ["2.625rem", "3.125rem"]);
  const fontSize = useTransform(hoverPhase, [0, 1], ["0.8125rem", "1.125rem"]);

  return (
    <Link href={href}>
      <motion.button
        ref={ref}
        style={{ width, height, fontSize }}
        className={cn(
          "relative flex items-center justify-center rounded-full font-medium transition-colors duration-300",
          active ? "text-black" : "text-white/70 hover:text-white"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full border border-white/10 transition-all duration-300",
            active
              ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              : "bg-white/10 backdrop-blur-sm"
          )}
        />
        <span className="relative z-10 whitespace-nowrap">{title}</span>
      </motion.button>
    </Link>
  );
}
