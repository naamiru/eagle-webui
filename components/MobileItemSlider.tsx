"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import { CloseButton, FocusTrap, Modal, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { getImageUrl } from "@/utils/item";
import classes from "./MobileItemSlider.module.css";

interface MobileItemSliderProps {
  initialItemId: string;
  libraryPath: string;
  itemIds: string[];
  dismiss: () => void;
  onChangeActiveItem: (itemId: string) => void;
}

export function MobileItemSlider({
  initialItemId,
  libraryPath,
  itemIds,
  dismiss,
  onChangeActiveItem,
}: MobileItemSliderProps) {
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
          {activeIndex + 1} / {itemIds.length}
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
          const nextId = itemIds[nextIndex];
          if (nextId) {
            setActiveIndex(nextIndex);
            onChangeActiveItem(nextId);
          }
        }}
      >
        {itemIds.map((itemId, index) => (
          <SwiperSlide key={itemId} virtualIndex={index}>
            <div className="swiper-zoom-container">
              {/** biome-ignore lint/performance/noImgElement: use swiper */}
              <img
                src={getImageUrl(itemId, libraryPath)}
                alt={itemId}
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
