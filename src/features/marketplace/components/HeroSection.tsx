import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import {
  ArrowRight,
  Pause,
  Play,
} from "lucide-react";

export interface HeroSlide {
  id: string;
  categorySlug: string;
  categoryLabel: string;
  title: string;
  description: string;
  ctaText: string;
  image: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "immobilier",
    categorySlug: "immobilier",
    categoryLabel: "Immobilier",
    title: "Trouvez le bien qui vous correspond.",
    description:
      "Découvrez des terrains, appartements, maisons et locaux à vendre ou à louer.",
    ctaText: "Explorer l'immobilier",
    image: "/images/hero/hero_immobilier_1791585876318.jpg",
  },
  {
    id: "vehicules",
    categorySlug: "vehicules",
    categoryLabel: "Véhicules",
    title: "Votre prochain véhicule vous attend.",
    description:
      "Découvrez des voitures, motos et véhicules disponibles auprès des annonceurs.",
    ctaText: "Explorer les véhicules",
    image: "/images/hero/hero_vehicules_1791585885996.jpg",
  },
  {
    id: "materiel-pro",
    categorySlug: "materiel-pro",
    categoryLabel: "Matériel pro",
    title: "Équipez vos projets en toute simplicité.",
    description:
      "Trouvez du matériel professionnel, des outils et des équipements adaptés à votre activité.",
    ctaText: "Découvrir le matériel pro",
    image: "/images/hero/hero_materiel_1791585897217.jpg",
  },
  {
    id: "mode",
    categorySlug: "mode",
    categoryLabel: "Mode",
    title: "Affirmez votre style.",
    description:
      "Explorez les vêtements, chaussures, accessoires et articles de mode disponibles.",
    ctaText: "Explorer la mode",
    image: "/images/hero/hero_mode_1791585907879.jpg",
  },
  {
    id: "maison-jardin",
    categorySlug: "maison-jardin",
    categoryLabel: "Maison & jardin",
    title: "Imaginez un intérieur qui vous ressemble.",
    description:
      "Découvrez des meubles, des objets de décoration et des équipements pour la maison et le jardin.",
    ctaText: "Explorer la maison",
    image: "/images/hero/hero_maison_1791585917725.jpg",
  },
  {
    id: "electronique",
    categorySlug: "electronique",
    categoryLabel: "Électronique",
    title: "La technologie à portée de main.",
    description:
      "Retrouvez des téléphones, ordinateurs, appareils électroniques et accessoires.",
    ctaText: "Explorer l'électronique",
    image: "/images/hero/hero_electronique_1791585927327.jpg",
  },
  {
    id: "loisirs",
    categorySlug: "loisirs",
    categoryLabel: "Loisirs",
    title: "Faites plus de place à vos passions.",
    description:
      "Découvrez des équipements de sport, des jeux, des livres et des articles de loisirs.",
    ctaText: "Explorer les loisirs",
    image: "/images/hero/hero_loisirs_1791585937323.jpg",
  },
  {
    id: "autres",
    categorySlug: "autres",
    categoryLabel: "Autres",
    title: "Trouvez aussi ce que vous n'attendiez pas.",
    description:
      "Explorez d'autres biens et découvrez de nouvelles opportunités sur Kawral.",
    ctaText: "Explorer les autres annonces",
    image: "/images/hero/hero_autres_1791585948000.jpg",
  },
];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0, 1]));
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const navigate = useNavigate();
  const { setFilters } = useApp();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Autoplay management
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(handleNext, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (delta > 45) {
      handleNext();
    } else if (delta < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const handleCategoryClick = (categorySlug: string) => {
    setFilters((prev) => ({ ...prev, category: categorySlug }));
    navigate(`/categories/${categorySlug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeSlide = HERO_SLIDES[currentSlide];

  useEffect(() => {
    const nextIdx = (currentSlide + 1) % HERO_SLIDES.length;
    const prevIdx = (currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    setLoadedSlides((prev) => {
      if (prev.has(currentSlide) && prev.has(nextIdx) && prev.has(prevIdx)) return prev;
      const next = new Set(prev);
      next.add(currentSlide);
      next.add(nextIdx);
      next.add(prevIdx);
      return next;
    });
  }, [currentSlide]);

  return (
    <section
      id="hero-section"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-[calc(100svh-70px)] sm:min-h-[620px] lg:min-h-[660px] h-[calc(100svh-70px)] sm:h-[78vh] sm:max-h-[820px] flex items-center justify-center overflow-hidden bg-[#0c1a22]"
    >
      {/* Background Images Slider */}
      {HERO_SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
          }`}
          aria-hidden={idx !== currentSlide}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out ${
              idx === currentSlide ? "scale-105" : "scale-100"
            }`}
            style={
              loadedSlides.has(idx)
                ? { backgroundImage: `url(${slide.image})` }
                : undefined
            }
          />
          {/* Subtle Dark Gradient Overlay for Maximum Legibility */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0c1a22]/85 via-black/55 to-[#0c1a22]/85" />
        </div>
      ))}

      {/* Main Centered Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 flex flex-col items-center justify-center text-center">

        {/* Editorial Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight max-w-4xl drop-shadow-xl mb-3 sm:mb-4 animate-fade-in">
          <span className="sr-only">Kawral — Petites annonces {activeSlide.categoryLabel} au Sénégal : </span>
          {activeSlide.title}
        </h1>

        {/* Editorial Subtitle / Description */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-200/95 max-w-2xl drop-shadow-md leading-relaxed font-medium mb-6 sm:mb-8 animate-fade-in">
          {activeSlide.description}
        </p>

        {/* Orange CTA Action Link (Crawlable SEO) */}
        <div className="animate-fade-in">
          <Link
            to={`/categories/${activeSlide.categorySlug}`}
            onClick={(e) => {
              e.preventDefault();
              handleCategoryClick(activeSlide.categorySlug);
            }}
            className="group inline-flex items-center gap-2.5 bg-kawral-orange hover:bg-kawral-orange-hover text-white no-underline px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>{activeSlide.ctaText}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Position Dots & Play/Pause Controls */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-2 sm:gap-2.5">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => {
              setCurrentSlide(idx);
              setIsPlaying(false);
            }}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide
                ? "bg-kawral-orange w-8 sm:w-10 shadow-md"
                : "bg-white/40 hover:bg-white/80 w-2"
            }`}
            aria-label={`Aller à la diapositive ${slide.categoryLabel}`}
            title={slide.categoryLabel}
          />
        ))}

        <div className="w-[1px] h-3.5 bg-white/30 mx-1 sm:mx-1.5" />

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 cursor-pointer shadow-sm"
          aria-label={isPlaying ? "Mettre en pause le carrousel" : "Démarrer le carrousel"}
          title={isPlaying ? "Mettre en pause" : "Démarrer"}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3" fill="currentColor" />
          ) : (
            <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Invisible Sentinel at bottom of Hero for scroll/intersection detection */}
      <div
        id="hero-sentinel"
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
};
