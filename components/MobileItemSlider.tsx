"use client";

import {
  Anchor,
  CloseButton,
  Drawer,
  FocusTrap,
  Modal,
  Text,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconExternalLink,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
} from "media-chrome/react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import type { Item, ItemPreview } from "@/data/types";
import { getImageUrl, getThumbnailUrl } from "@/utils/item";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import { useDisclosure } from "@mantine/hooks";
import { useSwipeable } from "react-swipeable";
import { useSingleTap } from "@/utils/useSingleTap";
import { ItemInspector } from "./ItemInspector";
import classes from "./MobileItemSlider.module.css";

interface MobileItemSliderProps {
  initialItemId: string;
  libraryPath: string;
  items: ItemPreview[];
  dismiss: () => void;
}

export function MobileItemSlider({
  initialItemId,
  libraryPath,
  items,
  dismiss,
}: MobileItemSliderProps) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const initialIndex = useMemo(
    () => Math.max(itemIds.indexOf(initialItemId), 0),
    [initialItemId, itemIds],
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
    [items],
  );

  const [isUIPresented, setIsUIPresented] = useState(true);
  const [isUIPresentedBeforeZoom, setIsUIPresentedBeforeZoom] = useState(true);

  const isZoomRef = useRef(false);
  const swipeHandlers = useSwipeable({
    onSwipedDown() {
      if (!isZoomRef.current) {
        dismiss();
      }
    },
  });

  const tapHandlers = useSingleTap({
    onSingleTap: useCallback(
      (e) => {
        if (isZoomRef.current) return;

        const target = e.target as HTMLElement;
        if (target.closest(".no-swiping") || target.closest(".no-ui-toggle"))
          return;

        setIsUIPresented(!isUIPresented);
      },
      [isUIPresented],
    ),
  });

  const slides = useMemo(
    () =>
      items.map((item, index) => (
        <SwiperSlide key={item.id} virtualIndex={index}>
          {item.ext === "url" ? (
            <MobileUrlContent item={item} libraryPath={libraryPath} />
          ) : item.duration > 0 ? (
            <MobileVideoContent item={item} libraryPath={libraryPath} />
          ) : (
            <MobileImageContent item={item} libraryPath={libraryPath} />
          )}
        </SwiperSlide>
      )),
    [items, libraryPath],
  );

  const [isInspectorPresented, { open: openInspector, close: closeInspector }] =
    useDisclosure(false);
  const drawerSwipeHandlers = useSwipeable({
    onSwipedRight: closeInspector,
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

      <header className={classes.header} data-ui-visible={isUIPresented}>
        <CloseButton icon={<IconArrowLeft stroke={1} />} onClick={dismiss} />
        <Text size="sm">
          {activeIndex + 1} / {items.length}
        </Text>
        <div className={classes.headerTrailing}>
          <CloseButton
            icon={<IconInfoCircle stroke={1.2} />}
            onClick={openInspector}
            aria-label="Inspector"
          />
        </div>
      </header>

      <div className={classes.wrapper} {...swipeHandlers}>
        <div className={classes.wrapper} {...tapHandlers}>
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
              }

              isZoomRef.current = false;
            }}
            onSlideChange={pauseVideo}
            onZoomChange={(_, scale) => {
              const isZoom = scale > 1.01;

              if (isZoom && !isZoomRef.current) {
                setIsUIPresentedBeforeZoom(isUIPresented);
                setIsUIPresented(false);
              } else if (!isZoom && isZoomRef.current) {
                setIsUIPresented(isUIPresentedBeforeZoom);
              }

              isZoomRef.current = isZoom;
            }}
          >
            {slides}
          </Swiper>
        </div>
      </div>

      <Drawer
        classNames={{
          header: classes.drawerHeader,
          content: classes.drawerContent,
        }}
        opened={isInspectorPresented}
        position="right"
        size="85%"
        onClose={closeInspector}
        {...drawerSwipeHandlers}
      >
        <ItemInspector itemId={items[activeIndex].id} />
      </Drawer>
    </Modal>
  );
}

type MobileContentProps = {
  item: ItemPreview;
  libraryPath: string;
};

function MobileImageContent({ item, libraryPath }: MobileContentProps) {
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

function MobileVideoContent({ item, libraryPath }: MobileContentProps) {
  const controlBarStyle = {
    "--media-tooltip-display": "none",
    margin: "5px 15px",
  } as CSSProperties;

  return (
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
      <MediaControlBar style={controlBarStyle}>
        <div className="no-swiping" style={{ display: "flex", flexGrow: 1 }}>
          <MediaPlayButton style={{ borderRadius: "15px 0 0 15px" }} />
          <MediaTimeRange style={{ width: "100%" }} />
          <MediaTimeDisplay showDuration />
          <MediaFullscreenButton style={{ borderRadius: "0 15px 15px 0" }} />
        </div>
      </MediaControlBar>
    </MediaController>
  );
}

function MobileUrlContent({ item, libraryPath }: MobileContentProps) {
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
        console.error(
          `[MobileUrlContent] Failed to load item ${item.id}:`,
          error,
        );
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
        className={`${classes.urlText} no-ui-toggle`}
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
      <a
        className={`${classes.urlImage} no-ui-toggle`}
        target={target}
        href={itemUrl}
        rel={rel}
      >
        {/** biome-ignore lint/performance/noImgElement: url thumbnail */}
        <img src={getThumbnailUrl(item.id, libraryPath)} alt="thumbnail" />
      </a>
      <div className={classes.urlMeta}>{metaContent}</div>
    </div>
  );
}
