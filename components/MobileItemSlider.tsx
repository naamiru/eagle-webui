"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Item } from "@/data/types";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import { CloseButton, FocusTrap, Modal, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { getImageUrl } from "@/utils/item";
import classes from "./MobileItemSlider.module.css";

interface MobileItemSliderProps {
  initialItem: Item;
  items: Item[];
  libraryPath: string;
  dismiss: () => void;
  onChangeActiveItem: (item: Item) => void;
}

export function MobileItemSlider({
  initialItem,
  items,
  libraryPath,
  dismiss,
  onChangeActiveItem,
}: MobileItemSliderProps) {
  const initialIndex = useMemo(
    () => items.findIndex((item) => item.id === initialItem.id),
    [initialItem, items]
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
          setActiveIndex(swiper.activeIndex);
          onChangeActiveItem(items[swiper.activeIndex]);
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
    </Modal>
  );
}
