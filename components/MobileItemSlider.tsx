"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import { CloseButton, FocusTrap, Modal, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
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
    [initialItemId, itemIds],
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
    </Modal>
  );
}
