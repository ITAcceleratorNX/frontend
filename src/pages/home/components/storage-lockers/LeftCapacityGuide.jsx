import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box } from "lucide-react";
import { LOCKER_CAPACITY_BY_VOLUME } from "./capacityByVolume";
import lockerImg1m from "@/assets/1m storage.png";
import lockerImg2m from "@/assets/2m storage.png";
import lockerImg3m from "@/assets/4m storage.png";
import lockerImg4m from "@/assets/3m storage.png";

const LOCKER_IMAGES = {
  1: lockerImg1m,
  2: lockerImg2m,
  3: lockerImg3m,
  4: lockerImg4m,
};

export default function LeftCapacityGuide({ volumeM3 }) {
  const items = LOCKER_CAPACITY_BY_VOLUME[volumeM3] ?? LOCKER_CAPACITY_BY_VOLUME[1];
  const imageSrc = LOCKER_IMAGES[volumeM3] ?? LOCKER_IMAGES[1];

  return (
    <div className="flex h-full min-h-[520px] flex-col rounded-[32px] bg-[#429475] p-8 shadow-lg sm:p-10">
      <header className="shrink-0">
        <h3 className="font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Гайд по объему
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
          Примеры ориентировочны и помогают оценить вместимость выбранного бокса.
        </p>
      </header>

      <div className="mt-8 flex min-h-0 flex-1 flex-col gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={volumeM3}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3 text-white">
              <Box
                className="h-6 w-6 shrink-0 text-white/95"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="font-sans text-base font-bold sm:text-lg">
                Что поместится в {volumeM3} м³
              </p>
            </div>

            <ul className="space-y-3">
              {items.map((line) => (
                <li
                  key={line}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 font-sans text-sm font-medium text-white ring-1 ring-white/15 sm:text-base"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-white"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-auto aspect-[489/252] w-full shrink-0 overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={volumeM3}
              src={imageSrc}
              alt={`Визуализация объёма ${volumeM3} м³`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[#429475]/10"
            aria-hidden
          />
          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-[2px]">
            <span className="font-sans text-xs font-medium text-[#2a5c4a]">
              Визуализация объема: {volumeM3} м³
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
