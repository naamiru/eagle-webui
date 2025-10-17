"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import "swiper/css/keyboard";
import { Anchor, CloseButton, Text } from "@mantine/core";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
} from "@tabler/icons-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Item, ItemPreview } from "@/data/types";
import { useSliderState } from "@/stores/slider-state";
import { getImageUrl, getThumbnailUrl } from "@/utils/item";
import AppHeader from "./AppHeader";
import classes from "./ItemSlider.module.css";

interface ItemSliderProps {
  initialItemId: string;
  libraryPath: string;
  items: ItemPreview[];
  dismiss: () => void;
}

export function ItemSlider({
  initialItemId,
  libraryPath,
  items,
  dismiss,
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
          {item.ext === "url" ? (
            <URLContent item={item} libraryPath={libraryPath} />
          ) : item.duration > 0 ? (
            <VideoContent item={item} libraryPath={libraryPath} />
          ) : (
            <ImageContent item={item} libraryPath={libraryPath} />
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

type ImageContentProp = {
  item: ItemPreview;
  libraryPath: string;
};

function ImageContent({ item, libraryPath }: ImageContentProp) {
  return (
    <div className="swiper-zoom-container">
      {/** biome-ignore lint/performance/noImgElement: use swiper */}
      <img
        src={getImageUrl(item.id, libraryPath)}
        alt={item.id}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

type VideoContentProp = {
  item: ItemPreview;
  libraryPath: string;
};

function VideoContent({ item, libraryPath }: VideoContentProp) {
  return (
    <div className={classes.videoContent}>
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
  );
}

type URLContentProp = {
  item: ItemPreview;
  libraryPath: string;
};

function URLContent({ item, libraryPath }: URLContentProp) {
  const [metadata, setMetadata] = useState<Pick<Item, "name" | "url"> | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    setMetadata(null);

    async function load() {
      try {
        const response = await fetch(`/api/items/${item.id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as Item;
        if (controller.signal.aborted) return;
        setMetadata({
          name: data.name,
          url: data.url,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(`[URLContent] Failed to load item ${item.id}:`, error);
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [item.id]);

  const itemUrl =
    metadata?.url && metadata.url.length > 0 ? metadata.url : undefined;
  const hasUrl = Boolean(itemUrl);
  const target = hasUrl ? "_blank" : undefined;
  const rel = hasUrl ? "noopener" : undefined;

  let metaContent: ReactNode = null;

  if (metadata) {
    const itemName = metadata.name || metadata.url || "Untitled item";
    metaContent = hasUrl ? (
      <Anchor
        className={classes.urlText}
        target={target}
        href={itemUrl}
        rel={rel}
      >
        {itemName}
        <IconExternalLink size={18} stroke={1} />
      </Anchor>
    ) : (
      <Text className={classes.urlText} component="span">
        {itemName}
      </Text>
    );
  }

  return (
    <div className={classes.urlContent}>
      <a className={classes.urlImage} target={target} href={itemUrl} rel={rel}>
        {/** biome-ignore lint/performance/noImgElement: url thumbnail */}
        <img src={getThumbnailUrl(item.id, libraryPath)} alt="thumbnail" />
      </a>
      <div className={classes.urlMeta}>{metaContent}</div>
    </div>
  );
}
