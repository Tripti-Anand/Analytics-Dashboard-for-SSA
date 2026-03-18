"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ServiceCard } from "@/types/service-card"

function CardContent({ card }: { card: ServiceCard }) {
  return (
    <div className="grid grid-cols-2 gap-12 items-center w-full h-full mt-6">

      {/* LEFT TEXT */}
      <div className="flex flex-col justify-center max-w-xl space-y-6">
        {card.desc && (
          <p className="text-lg text-zinc-300 leading-relaxed">
            {card.desc}
          </p>
        )}
      </div>

      {/* RIGHT VISUAL */}
      <div className="flex items-center justify-center w-full h-full">

        {card.type === "image" && card.imageSrc && (
          <img
            src={card.imageSrc}
            alt={card.title}
            className="max-w-[340px] max-h-[340px] object-contain rounded-xl shadow-xl"
          />
        )}

        {card.type === "chart" && (
          <img
            src="https://services.swpc.noaa.gov/images/goes-xray-flux.png"
            className="max-w-[420px] rounded-xl shadow-xl"
          />
        )}

        {card.type === "options" && card.options && (
          <div className="flex flex-wrap gap-3">
            {card.options.map((o) => (
              <button
                key={o}
                className="px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition"
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Card({
  card,
  index,
  total,
  progress,
}: {
  card: ServiceCard
  index: number
  total: number
  progress: any
}) {
  const start = index / total
  const end = (index + 1) / total

  const scale = useTransform(progress, [start, end], [1, 0.9])

  return (
    <div className="h-screen sticky top-0 flex items-center justify-center">

      <motion.div
        style={{
          scale,
          zIndex: total - index,
        }}
        className={`
          relative
          w-[82%]
          h-[65vh]
          rounded-[2.5rem]
          border ${card.border}
          p-14
          flex flex-col
          shadow-2xl
          backdrop-blur-xl
          bg-gradient-to-br ${card.color}
        `}
      >
        <span className="text-sm text-white/40 font-mono">{card.id}</span>

        <h2 className="text-5xl font-black tracking-tight text-white">
          {card.title}
        </h2>

        <CardContent card={card} />

        {/* glow */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full"></div>
      </motion.div>

    </div>
  )
}

export default function ServiceCards({ cards }: { cards: ServiceCard[] }) {

  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `${cards.length * 100}vh` }}
    >
      {cards.map((card, i) => (
        <Card
          key={card.id}
          card={card}
          index={i}
          total={cards.length}
          progress={scrollYProgress}
        />
      ))}
    </section>
  )
}