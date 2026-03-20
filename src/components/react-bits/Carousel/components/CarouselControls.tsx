/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "motion/react";
import { memo } from "react";

interface CarouselControlsProps {
  handlePrev: () => void;
  handleNext: () => void;
  items: any[];
  activeIndex: number;
  setPosition: (idx: number) => void;
  loop: boolean;
  arrowClassName: string;
}

const CarouselControls = memo(
  ({
    handlePrev,
    handleNext,
    items,
    activeIndex,
    setPosition,
    loop,
    arrowClassName,
  }: CarouselControlsProps) => {
    // Check if arrowClassName is a hex color (starts with #)
    const isHexColor = arrowClassName.startsWith("#");
    const arrowStyle = isHexColor ? { color: arrowClassName } : {};
    const arrowClass = isHexColor ? "" : arrowClassName;

    return (
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15 ${arrowClass}`}
          style={arrowStyle}
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex gap-2">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 cursor-pointer rounded-full transition-colors duration-200 ${
                activeIndex !== index ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
              animate={{
                scale: activeIndex === index ? 1 : 0.9,
              }}
              onClick={() => setPosition(loop ? index + 1 : index)}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15 ${arrowClass}`}
          style={arrowStyle}
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>
    );
  },
);
CarouselControls.displayName = "CarouselControls";

export default CarouselControls;
