import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STORAGE_FORMATS = [
  {
    title: "Индивидуальное хранение",
    description: "Личный бокс для хранения вещей с самостоятельным доступом.",
    points: ["Личный бокс", "Доступ 24/7", "Для дома и бизнеса"],
    to: "/individual-storage",
    imageWebp: "/images/formats/01.webp",
    imagePng: "/images/formats/01.jpg",
    imageAlt: "Индивидуальное хранение — личный бокс",
    loading: "eager",
    badge: "Популярно",
  },
  {
    title: "Облачное хранение",
    description: "Мы забираем, храним и возвращаем ваши вещи по запросу.",
    points: ["Забор вещей", "Хранение на складе", "Возврат по запросу"],
    to: "/cloud-storage",
    imageWebp: "/images/formats/02.webp",
    imagePng: "/images/formats/02.png",
    imageAlt: "Облачное хранение — забор и возврат вещей",
    loading: "lazy",
    badge: "Сервис",
  },
  {
    title: "Камера хранения",
    description: "Краткосрочное хранение сумок, чемоданов и небольших вещей.",
    points: ["От 1 дня", "До 2 недель", "Чемоданы и сумки"],
    to: "/storage-room",
    imageWebp: "/images/formats/03.webp",
    imagePng: "/images/formats/03.png",
    imageAlt: "Камера хранения — краткосрочное хранение",
    loading: "lazy",
    badge: "Быстро",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function StorageFormatsSection() {
  return (
    <section id="storage-formats-section" className="w-full bg-stone-50 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <h2 className="font-soyuz-grotesk text-3xl font-bold text-[#202422] sm:text-4xl md:text-5xl">
            Форматы хранения
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {STORAGE_FORMATS.map((item) => (
            <motion.article key={item.title} variants={cardVariants} className="h-full">
              <Link
                to={item.to}
                aria-label={`${item.title} — перейти на страницу услуги`}
                className="group block h-full rounded-2xl bg-[#F5F6F8] p-2 transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-normal focus-visible:ring-offset-2"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <picture>
                    <source srcSet={item.imageWebp} type="image/webp" />
                    <img
                      src={item.imagePng}
                      alt={item.imageAlt}
                      loading={item.loading}
                      decoding="async"
                      width="1200"
                      height="900"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </picture>

                  <span className="absolute right-3 top-3 rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    {item.badge}
                  </span>
                </div>

                <div className="-mt-12 relative z-10 mx-3 flex min-h-[290px] flex-col rounded-2xl bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.12)] sm:min-h-[300px] sm:p-6">
                  <h3 className="mb-2 text-xl font-bold leading-tight text-[#202422]">{item.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-[#5C625F]">{item.description}</p>
                  <ul className="mb-5 space-y-2.5">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-[#202422]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-normal" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center text-sm font-semibold text-black transition-colors group-hover:text-green-normal">
                    Подробнее →
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
