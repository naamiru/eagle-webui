"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Item } from "@/data/types";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import "swiper/css/keyboard";
import { CloseButton, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useSliderState } from "@/stores/slider-state";
import { getImageUrl } from "@/utils/item";
import AppHeader from "./AppHeader";
import classes from "./ItemSlider.module.css";

interface ItemSliderProps {
  initialItem: Item;
  items: Item[];
  libraryPath: string;
  dismiss: () => void;
  onChangeActiveItem: (item: Item) => void;
}

export function ItemSlider({
  initialItem,
  items,
  libraryPath,
  dismiss,
  onChangeActiveItem,
}: ItemSliderProps) {
  const initialIndex = useMemo(
    () => items.findIndex((item) => item.id === initialItem.id),
    [initialItem, items],
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // ESC to dismiss
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dismiss]);

  const { setIsPresented } = useSliderState();
  // biome-ignore lint/correctness/useExhaustiveDependencies: depend on lifecycle
  useEffect(() => {
    setIsPresented(true);
    return () => setIsPresented(false);
  }, []);

  return (
    <>
      <AppHeader>
        <CloseButton icon={<IconArrowLeft stroke={1.2} />} onClick={dismiss} />
        <Text size="sm">
          {activeIndex + 1} / {items.length}
        </Text>
      </AppHeader>

      <Swiper
        modules={[Zoom, Virtual, Keyboard]}
        zoom={true}
        virtual
        keyboard={{
          enabled: true,
        }}
        spaceBetween={16}
        initialSlide={initialIndex}
        className={classes.swiper}
        tabIndex={0}
        onActiveIndexChange={(swiper) => {
          onChangeActiveItem(items[swiper.activeIndex]);
          setActiveIndex(swiper.activeIndex);
        }}
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
    </>
  );
}
