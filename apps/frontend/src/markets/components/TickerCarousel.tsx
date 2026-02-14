import { FreeMode, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { ReactNode } from "react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

interface TickerCarouselProps {
  /** Slides: id used for React key, node is the slide content */
  slides: { id: string; node: ReactNode }[];
  /** Unique id for this carousel (e.g. category id) for scrollbar styling scope */
  id: string;
}

export function TickerCarousel({ slides, id }: TickerCarouselProps) {
  return (
    <div className="ticker-carousel pr-2" data-carousel-id={id}>
      <Swiper
        className="overflow-hidden"
        modules={[FreeMode, Scrollbar]}
        spaceBetween={12}
        slidesPerView="auto"
        freeMode={{ enabled: true, momentum: true }}
        grabCursor
        scrollbar={{
          hide: false,
          draggable: true,
        }}
        resistanceRatio={0}
      >
        {slides.map(({ id: slideId, node }) => (
          <SwiperSlide key={slideId} className="w-auto! shrink-0!">
            {node}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
