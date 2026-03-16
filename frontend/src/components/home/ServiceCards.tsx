"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ServiceCard } from "@/types/service-card";

/* ---------------- CARD CONTENT RENDERER ---------------- */

function CardContent({ card }: { card: ServiceCard }) {
  switch (card.type) {
    case "image":
      return (
        <div className="flex items-start gap-12 mt-8">
          {/* Image (left aligned, controlled size) */}
          <div className="w-[40%] max-w-[420px]">
            <img
              src={card.imageSrc}
              alt={card.title}
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>

          {/* Optional description / placeholder area */}
          {card.desc && (
            <p className="flex-1 text-2xl md:text-3xl text-zinc-400 font-medium leading-tight">
              {card.desc}
            </p>
          )}
        </div>
      );

    case "chart":
      return (
        <div className="w-full h-64 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          {/* Replace later with real chart */}
          <span className="text-white/40 text-lg">
            Chart Placeholder
          </span>
        </div>
      );

    case "options": {
      const [channel, setChannel] = useState("131");

      return (
        <div className="flex flex-col gap-8">

          <div className="flex flex-wrap gap-4">
            {card.options?.map((opt) => {
              const value = opt.replace("Å", "");

              return (
                <button
                  key={opt}
                  onClick={() => setChannel(value)}
                  className="px-6 py-3 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition"
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="w-[40%] max-w-[420px]">
            <img
              src={`https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_${channel}.jpg`}
              alt="AIA EUV"
              className="w-full rounded-2xl"
            />
          </div>

        </div>
      );
    }

    default:
      return (
        <p className="text-2xl md:text-3xl text-zinc-400 max-w-xl font-medium leading-tight">
          {card.desc}
        </p>
      );
  }
}

/* ---------------- SINGLE CARD ---------------- */

const Card = ({
  card,
  i,
  progress,
  range,
  targetScale,
}: {
  card: ServiceCard;
  i: number;
  progress: any;
  range: number[];
  targetScale: number;
}) => {
  const scale = useTransform(progress, range, [1, targetScale], {
    clamp: true,
    });

  return (
    <div className="h-screen flex items-center justify-center sticky top-0">
      <motion.div
        style={{
          scale,
          backgroundColor: card.color,
          top: `calc(5vh + ${i * 25}px)`,
        }}
        className={`relative -top-[10%] w-[90%] h-[80vh] rounded-[3rem] border ${card.border} p-12 md:p-20 flex flex-col justify-between shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden`}
      >
        {/* Header */}
        <div className="space-y-4">
          <span className="font-mono text-zinc-500 text-xl">
            {card.id}
          </span>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            {card.title}
          </h2>
        </div>

        {/* Dynamic Content */}
        <CardContent card={card} />

        {/* Decorative gradient */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
      </motion.div>
    </div>
  );
};

/* ---------------- CARDS CONTAINER ---------------- */

export default function ServiceCards({
  cards,
}: {
  cards: ServiceCard[];
}) {
  const container = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });

  return (
    <section ref={container} className="relative mt-[10vh]">
      {cards.map((card, i) => {
        const targetScale = 1 - (cards.length - i) * 0.03;

        return (
          <Card
            key={card.id}
            card={card}
            i={i}
            progress={scrollYProgress}
            range={[i * (1 / cards.length), 1]}
            targetScale={targetScale}
          />
        );
      })}
    </section>
  );
}
