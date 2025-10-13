"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Item } from "@/data/types";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import "swiper/css/keyboard";
import { useEffect, useMemo } from "react";
import { getImageUrl } from "@/utils/item";
import classes from "./ItemSlider.module.css";

interface ItemSliderProps {
  initialItem: Item;
  items: Item[];
  libraryPath: string;
  dismiss: () => void;
}

export function ItemSlider({
  initialItem,
  items,
  libraryPath,
  dismiss,
}: ItemSliderProps) {
  const initialIndex = useMemo(
    () => items.findIndex((item) => item.id === initialItem.id),
    [initialItem, items]
  );

  // ESC to dismiss
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dismiss]);

  return (
    <Swiper
      modules={[Zoom, Virtual, Keyboard]}
      zoom={true}
      virtual
      keyboard={{
        enabled: true,
      }}
      initialSlide={initialIndex}
      className={classes.swiper}
      tabIndex={0}
    >
      {items.map((item, index) => (
        <SwiperSlide key={item.id} virtualIndex={index}>
          <div className="swiper-zoom-container">
            {/** biome-ignore lint/performance/noImgElement: use swiper */}
            <img
              src={getImageUrl(item.id, libraryPath)}
              alt={item.name}
              loading="lazy"
              decoding="async"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
