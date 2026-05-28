import React from "react";
import { motion } from "framer-motion";
import { Box, KeyRound, Luggage } from "lucide-react";

const EXPLAINER_ITEMS = [
  {
    Icon: KeyRound,
    title: "Нужен личный доступ",
    text: "Подойдет индивидуальное хранение — вы арендуете личный закрытый бокс, сами размещаете вещи и получаете доступ к ним в любое удобное время.",
  },
  {
    Icon: Box,
    title: "Хранение без поездки на склад",
    text: "Подойдет облачное хранение — команда Extra Space забирает вещи, хранит их на складе и возвращает обратно по вашему запросу.",
  },
  {
    Icon: Luggage,
    title: "Оставить вещи ненадолго",
    text: "Подойдет камера хранения — вы оставляете чемоданы, сумки и личные вещи на короткий срок от 1 дня до 2 недель без долгого договора.",
  },
];

export default function StorageFormatsExplainerSection() {
  return (
    <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lg:col-span-5">
            <h2 className="font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl md:text-5xl">
              Какой формат подойдет именно вам?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5C625F] sm:text-base">
              Выберите формат под задачу: постоянный личный доступ, хранение без поездок или краткосрочное размещение вещей.
            </p>
          </div>

          <div className="space-y-3 lg:col-span-7">
            {EXPLAINER_ITEMS.map((item, index) => (
              <motion.article
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: index * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F5F4]">
                    <item.Icon className="h-5 w-5 text-green-normal" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#202422] sm:text-lg">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#5C625F] sm:text-[15px]">{item.text}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
