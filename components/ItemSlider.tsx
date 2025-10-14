"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import "swiper/css/keyboard";
import { CloseButton, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import type { ItemPreview } from "@/data/types";
import { useSliderState } from "@/stores/slider-state";
import { getImageUrl } from "@/utils/item";
import AppHeader from "./AppHeader";
import classes from "./ItemSlider.module.css";

interface ItemSliderProps {
  initialItemId: string;
  libraryPath: string;
  items: ItemPreview[];
  dismiss: () => void;
  onChangeActiveItem: (itemId: string) => void;
}

export function ItemSlider({
  initialItemId,
  libraryPath,
  items,
  dismiss,
  onChangeActiveItem,
}: ItemSliderProps) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const initialIndex = useMemo(
    () => Math.max(itemIds.indexOf(initialItemId), 0),
    [initialItemId, itemIds],
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
          const nextIndex = swiper.activeIndex;
          const nextItem = items[nextIndex];
          if (nextItem) {
            onChangeActiveItem(nextItem.id);
            setActiveIndex(nextIndex);
          }
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id} virtualIndex={index}>
            <div className="swiper-zoom-container">
              {/** biome-ignore lint/performance/noImgElement: use swiper */}
              <img
                src={getImageUrl(item.id, libraryPath)}
                alt={item.id}
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
