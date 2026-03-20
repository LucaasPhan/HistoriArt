import { motion, useTransform } from "motion/react";
import { memo } from "react";
import { CarouselItemProps } from "../types";

const CarouselItem = memo(
  ({ item, index, itemWidth, round, trackItemOffset, x, transition }: CarouselItemProps) => {
    const range = [
      -(index + 1) * trackItemOffset,
      -index * trackItemOffset,
      -(index - 1) * trackItemOffset,
    ];
    const outputRange = [90, 0, -90];
    const rotateY = useTransform(x, range, outputRange, { clamp: false });

    return (
      <motion.div
        key={index}
        className={`relative flex shrink-0 flex-col ${
          round
            ? "items-center justify-center border-0 bg-[#060010] text-center"
            : "items-start justify-between rounded-[12px] border border-[#222] bg-[#222]"
        } cursor-grab overflow-hidden active:cursor-grabbing`}
        style={{
          width: itemWidth,
          height: round ? itemWidth : "100%",
          rotateY: rotateY,
          ...(round && { borderRadius: "50%" }),
        }}
        transition={transition}
      >
        <div className={`${round ? "m-0 p-0" : "mb-4 p-5"}`}>
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#060010]">
            {item.icon}
          </span>
        </div>
        <div className="p-5">
          <div className="mb-1 text-lg font-black text-white">{item.title}</div>
          <p className="text-sm text-white">{item.description}</p>
        </div>
      </motion.div>
    );
  },
);
CarouselItem.displayName = "CarouselItem";

export default CarouselItem;
