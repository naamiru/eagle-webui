"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import "swiper/css/keyboard";
import { CloseButton, Text } from "@mantine/core";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ItemPreview } from "@/data/types";
import { useSliderState } from "@/stores/slider-state";
import { getImageUrl, getThumbnailUrl } from "@/utils/item";
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
  const swiperRef = useRef<SwiperType | null>(null);

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

  const playAndPauseVideo = useCallback(
    (swiper: SwiperType) => {
      if (!swiper.slides) return;
      for (const slide of swiper.slides) {
        const index = parseInt(slide.dataset.swiperSlideIndex ?? "", 10);
        if (Number.isNaN(index)) continue;
        const item = items[index];
        if (!item || item.duration === 0) continue;
        const video = slide.querySelector("video");
        if (video) {
          if (index === swiper.activeIndex) {
            video.play();
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      }
    },
    [items],
  );

  const handlePrevious = useCallback(() => {
    if (activeIndex === 0) return;
    swiperRef.current?.slidePrev();
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    if (activeIndex === items.length - 1) return;
    swiperRef.current?.slideNext();
  }, [activeIndex, items.length]);

  const slides = useMemo(
    () =>
      items.map((item, index) => (
        <SwiperSlide key={item.id} virtualIndex={index}>
          {item.duration > 0 ? (
            <div className={classes.videoContainer}>
              <div
                className={classes.videoFitbox}
                style={
                  {
                    "--ratio": `(${item.width}/${item.height})`,
                  } as React.CSSProperties
                }
              >
                {/** biome-ignore lint/a11y/useMediaCaption: simple video */}
                <video
                  className={classes.video}
                  src={getImageUrl(item.id, libraryPath)}
                  poster={getThumbnailUrl(item.id, libraryPath)}
                  playsInline
                  loop
                  controls
                />
              </div>
            </div>
          ) : (
            <div className="swiper-zoom-container">
              {/** biome-ignore lint/performance/noImgElement: use swiper */}
              <img
                src={getImageUrl(item.id, libraryPath)}
                alt={item.id}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </SwiperSlide>
      )),
    [items, libraryPath],
  );

  return (
    <>
      <AppHeader>
        <CloseButton icon={<IconArrowLeft stroke={1.2} />} onClick={dismiss} />
        <Text size="sm">
          {activeIndex + 1} / {items.length}
        </Text>
        <div className={classes.headerTrailing}>
          <CloseButton
            icon={<IconChevronLeft stroke={1.2} />}
            disabled={activeIndex === 0}
            onClick={handlePrevious}
          />
          <CloseButton
            icon={<IconChevronRight stroke={1.2} />}
            disabled={activeIndex === items.length - 1}
            onClick={handleNext}
          />
        </div>
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
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onActiveIndexChange={(swiper) => {
          const nextIndex = swiper.activeIndex;
          const nextItem = items[nextIndex];
          if (nextItem) {
            onChangeActiveItem(nextItem.id);
            setActiveIndex(nextIndex);
          }
        }}
        onAfterInit={(swiper) => {
          swiperRef.current = swiper;
          requestAnimationFrame(() => {
            playAndPauseVideo(swiper);
          });
        }}
        onSlideChange={playAndPauseVideo}
      >
        {slides}
      </Swiper>
    </>
  );
}
