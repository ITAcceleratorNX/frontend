import React, { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

const HERO_VIDEO_POSTER = "/videos/extraspace-poster.jpg";

export default function HeroSection({ onOpenPromoBooking, onBookClick }) {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);

    useEffect(() => {
        if (typeof navigator !== "undefined" && navigator.connection?.saveData) {
            return undefined;
        }

        let cancelled = false;

        const load = () => {
            if (cancelled) return;
            import("@/video/extraspace.mp4")
                .then((mod) => {
                    if (!cancelled) setVideoSrc(mod.default);
                })
                .catch(() => {});
        };

        if (typeof requestIdleCallback === "function") {
            const id = requestIdleCallback(load, { timeout: 1800 });
            return () => {
                cancelled = true;
                cancelIdleCallback(id);
            };
        }

        const t = window.setTimeout(load, 120);
        return () => {
            cancelled = true;
            window.clearTimeout(t);
        };
    }, []);

    useEffect(() => {
        if (!videoSrc) return;
        const el = videoRef.current;
        if (!el) return;
        el.load();
        const p = el.play();
        if (p !== undefined && typeof p.catch === "function") {
            p.catch(() => {});
        }
    }, [videoSrc]);

    return (
        <div
            id="home-hero-section"
            className="flex-1 relative overflow-hidden -mt-16 pt-16 min-h-[100vh] flex flex-col"
        >
            <video
                ref={videoRef}
                src={videoSrc ?? undefined}
                poster={HERO_VIDEO_POSTER}
                autoPlay
                muted
                loop
                playsInline
                preload={videoSrc ? "metadata" : "none"}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" aria-hidden />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8 sm:pb-12 lg:pb-16 relative z-10 flex-1 flex flex-col min-h-0">
                <section className="grid grid-cols-1 grid-rows-[1fr_auto] flex-1 min-h-0 items-center text-center">
                    <div className="flex flex-col items-center justify-start -mt-16 sm:-mt-24 lg:-mt-28">
                        <h1 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            храните там, где удобно
                        </h1>
                        <h2 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 sm:mb-8">
                            и безопасно
                        </h2>
                        {/* Боксы от 2 до 50 м² по специальной цене при аренде от 2 месяцев.
                        Хранение за м² от 5 990 ₸
                        <div className="text-sm sm:text-base text-white leading-relaxed max-w-2xl">
                            <p className="mb-1">Боксы от 2 до 50 м² по специальной цене при аренде от 2 месяцев.</p>
                            <p className="flex flex-wrap items-center justify-center">
                                <button
                                    type="button"
                                    onClick={onOpenPromoBooking}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E0F2F1] font-normal text-sm sm:text-base rounded-xl text-left cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
                                >
                                    <Gift size={18} strokeWidth={2} className="text-[#00897B] shrink-0" aria-hidden />
                                    <span className="text-[#00897B]">Хранение за м² от 5 990 ₸</span>
                                </button>
                            </p>
                        </div>
                        */}
                    </div>
                    <div className="flex flex-col items-center mb-8 sm:mb-12">
                        <button
                            type="button"
                            onClick={onBookClick ?? onOpenPromoBooking}
                            className="flex w-full max-w-[22rem] items-center justify-center gap-2 rounded-full bg-[#31876D] px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#2a7260] sm:w-auto sm:min-w-[15rem] sm:text-base"
                        >
                            <span>Выбрать склад</span>
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
