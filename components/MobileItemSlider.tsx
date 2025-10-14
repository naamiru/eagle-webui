"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import { ActionIcon, CloseButton, FocusTrap, Modal, Text } from "@mantine/core";
import { IconArrowLeft, IconPlayerPlayFilled } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import type { ItemPreview } from "@/data/types";
import { getImageUrl } from "@/utils/item";
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
            setActiveIndex(nextIndex);
            onChangeActiveItem(nextItem.id);
          }
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id} virtualIndex={index}>
            {item.duration > 0 ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                {/** biome-ignore lint/a11y/useMediaCaption: simple video */}
                <video
                  src={getImageUrl(item.id, libraryPath)}
                  playsInline={false}
                  controls={false}
                  loop
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
                <ActionIcon
                  className={classes.videoPlayButton}
                  variant="filled"
                  size={60}
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    const slide = (e.currentTarget as HTMLElement)
                      .parentElement;
                    const video = slide?.querySelector(
                      "video"
                    ) as HTMLVideoElement | null;
                    if (!video) return;

                    video.setAttribute("playsinline", "");
                    enterFullscreen(video).finally(() => {
                      const p = video.play();
                      p?.catch(() => {});
                    });
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                  }}
                >
                  <IconPlayerPlayFilled />
                </ActionIcon>
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
        ))}
      </Swiper>
    </Modal>
  );
}

async function enterFullscreen(el: HTMLVideoElement | HTMLElement) {
  const video = el as HTMLVideoElement;

  // 1) Standard Fullscreen API (Android/Chromium/Firefox/Desktop Safari)
  if (video.requestFullscreen) {
    try {
      await video.requestFullscreen();
      return;
    } catch (e) {
      // e.g., NotAllowedError when not triggered by a user gesture
      // fall through to other vendor-specific methods
    }
  }

  // 2) iOS Safari (iPhone/iPad) – non-standard API
  const anyVid = video as any;
  if (typeof anyVid.webkitEnterFullscreen === "function") {
    anyVid.webkitEnterFullscreen(); // Does not return a Promise
    return;
  }

  // 3) Other Safari variants (e.g., iPad) – additional vendor APIs
  if (typeof anyVid.webkitRequestFullscreen === "function") {
    try {
      anyVid.webkitRequestFullscreen();
      return;
    } catch {}
  }
  if (typeof anyVid.webkitSetPresentationMode === "function") {
    try {
      anyVid.webkitSetPresentationMode("fullscreen");
      return;
    } catch {}
  }

  // 4) Last resort: request fullscreen on the parent element
  const parent = video.parentElement;
  if (parent?.requestFullscreen) {
    try {
      await parent.requestFullscreen();
      return;
    } catch {}
  }
}
