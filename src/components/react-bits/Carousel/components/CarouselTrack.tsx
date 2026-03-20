/* eslint-disable @typescript-eslint/no-explicit-any */
import { MotionValue } from "motion/react";
import { memo } from "react";
import { CarouselItemProps } from "../types";
import CarouselItem from "./CarouselItem";

interface CarouselTrackProps {
  itemsForRender: any[];
  renderItem?: (props: CarouselItemProps) => React.ReactNode;
  itemWidth: number;
  round: boolean;
  trackItemOffset: number;
  x: MotionValue<number>;
  effectiveTransition: any;
}

const CarouselTrack = memo(
  ({
    itemsForRender,
    renderItem,
    itemWidth,
    round,
    trackItemOffset,
    x,
    effectiveTransition,
  }: CarouselTrackProps) => {
    return (
      <>
        {itemsForRender.map((item, index) =>
          renderItem ? (
            renderItem({
              item,
              index,
              itemWidth,
              round,
              trackItemOffset,
              x,
              transition: effectiveTransition,
            })
          ) : (
            <CarouselItem
              key={`${item.id || index}-${index}`}
              item={item}
              index={index}
              itemWidth={itemWidth}
              round={round}
              trackItemOffset={trackItemOffset}
              x={x}
              transition={effectiveTransition}
            />
          ),
        )}
      </>
    );
  },
);

CarouselTrack.displayName = "CarouselTrack";

export default CarouselTrack;
