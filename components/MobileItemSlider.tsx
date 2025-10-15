"use client";

import { CloseButton, FocusTrap, Modal, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
} from "media-chrome/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { ItemPreview } from "@/data/types";
import { getImageUrl, getThumbnailUrl } from "@/utils/item";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import { useSwipeable } from "react-swipeable";
import classes from "./MobileItemSlider.module.css";

interface MobileItemSliderProps {
  initialItemId: string;
  libraryPath: string;
  items: ItemPreview[];
  dismiss: () => void;
  onChangeActiveItem: (itemId: string) => void;
}

export function MobileItemSlider({
  initialItemId,
  libraryPath,
  items,
  dismiss,
  onChangeActiveItem,
}: MobileItemSliderProps) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const initialIndex = useMemo(
    () => Math.max(itemIds.indexOf(initialItemId), 0),
    [initialItemId, itemIds]
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const pauseVideo = useCallback(
    (swiper: SwiperType) => {
      if (!swiper.slides) return;
      for (const slide of swiper.slides) {
        const index = parseInt(slide.dataset.swiperSlideIndex ?? "", 10);
        if (Number.isNaN(index)) continue;
        const item = items[index];
        if (!item || item.duration === 0) continue;
        const video = slide.querySelector("video");
        if (video) {
          if (index !== swiper.activeIndex) {
            if (!video.paused && !video.ended) {
              video.pause();
            }
          }
        }
      }
    },
    [items]
  );

  const isZoomRef = useRef(false);
  const swipeHandlers = useSwipeable({
    onSwipedDown() {
      if (!isZoomRef.current) {
        dismiss();
      }
    },
  });

  return (
    <Modal
      opened={true}
      onClose={dismiss}
      withCloseButton={false}
      fullScreen
      radius={0}
      classNames={{
        body: classes.modalBody,
      }}
    >
      <FocusTrap.InitialFocus />

      <header className={classes.header}>
        <CloseButton icon={<IconArrowLeft stroke={1.2} />} onClick={dismiss} />
        <Text size="sm">
          {activeIndex + 1} / {items.length}
        </Text>
      </header>

      <div
        style={{
          width: "100%",
          height: "100%",
        }}
        {...swipeHandlers}
      >
        <Swiper
          modules={[Zoom, Virtual, Keyboard]}
          zoom
          virtual
          keyboard={{
            enabled: true,
          }}
          spaceBetween={16}
          initialSlide={initialIndex}
          className={classes.swiper}
          tabIndex={0}
          noSwiping
          noSwipingClass="no-swiping"
          onActiveIndexChange={(swiper) => {
            const nextIndex = swiper.activeIndex;
            const nextItem = items[nextIndex];
            if (nextItem) {
              setActiveIndex(nextIndex);
              onChangeActiveItem(nextItem.id);
            }

            isZoomRef.current = false;
          }}
          onSlideChange={pauseVideo}
          onZoomChange={(_, scale) => {
            isZoomRef.current = scale > 1.01;
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.id} virtualIndex={index}>
              {item.duration > 0 ? (
                <MediaController style={{ width: "100%", height: "100%" }}>
                  {/** biome-ignore lint/a11y/useMediaCaption: simple video */}
                  <video
                    slot="media"
                    src={getImageUrl(item.id, libraryPath)}
                    poster={getThumbnailUrl(item.id, libraryPath)}
                    playsInline
                    loop
                    style={{
                      objectFit: "contain",
                      backgroundColor: "white",
                    }}
                  />
                  <MediaControlBar
                    style={
                      {
                        "--media-tooltip-display": "none",
                        margin: "5px 15px",
                      } as React.CSSProperties
                    }
                  >
                    <MediaPlayButton
                      style={{ borderRadius: "15px 0 0 15px" }}
                    />
                    <div className="no-swiping" style={{ flexGrow: "1" }}>
                      <MediaTimeRange style={{ width: "100%" }} />
                    </div>
                    <MediaTimeDisplay showDuration />
                    <MediaFullscreenButton
                      style={{ borderRadius: "0 15px 15px 0" }}
                    />
                  </MediaControlBar>
                </MediaController>
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
          ))}
        </Swiper>
      </div>
    </Modal>
  );
}
