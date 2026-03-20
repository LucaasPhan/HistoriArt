/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "motion/react";
import { memo } from "react";

interface CarouselDotsProps {
  items: any[];
  activeIndex: number;
  setPosition: (idx: number) => void;
  loop: boolean;
  round: boolean;
}

const CarouselDots = memo(({ items, activeIndex, setPosition, loop, round }: CarouselDotsProps) => (
  <div
    className={`flex w-full justify-center ${round ? "absolute bottom-12 left-1/2 z-20 -translate-x-1/2" : ""}`}
  >
    <div className="mt-4 flex w-[150px] justify-between px-8">
      {items.map((_, index) => (
        <motion.div
          key={index}
          className={`h-2 w-2 cursor-pointer rounded-full transition-colors duration-150 ${
            activeIndex === index
              ? round
                ? "bg-white"
                : "bg-[#333333]"
              : round
                ? "bg-[#555]"
                : "bg-[rgba(51,51,51,0.4)]"
          }`}
          animate={{
            scale: activeIndex === index ? 1.2 : 1,
          }}
          onClick={() => setPosition(loop ? index + 1 : index)}
          transition={{ duration: 0.15 }}
        />
      ))}
    </div>
  </div>
));
CarouselDots.displayName = "CarouselDots";

export default CarouselDots;
