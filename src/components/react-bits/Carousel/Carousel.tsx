/* eslint-disable react-hooks/set-state-in-effect */
import { motion, PanInfo, useMotionValue } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCircle, FiCode, FiFileText, FiLayers, FiLayout } from "react-icons/fi";
import CarouselControls from "./components/CarouselControls";
import CarouselDots from "./components/CarouselDots";
import CarouselTrack from "./components/CarouselTrack";
import { CarouselProps, CarouselItem as ICarouselItem } from "./types";

const DEFAULT_ITEMS: ICarouselItem[] = [
  {
    title: "Text Animations",
    description: "Cool text animations for your projects.",
    id: 1,
    icon: <FiFileText className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Animations",
    description: "Smooth animations for your projects.",
    id: 2,
    icon: <FiCircle className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Components",
    description: "Reusable components for your projects.",
    id: 3,
    icon: <FiLayers className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Backgrounds",
    description: "Beautiful backgrounds and patterns for your projects.",
    id: 4,
    icon: <FiLayout className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Common UI",
    description: "Common UI components are coming soon!",
    id: 5,
    icon: <FiCode className="h-[16px] w-[16px] text-white" />,
  },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const Carousel = memo(
  ({
    items = DEFAULT_ITEMS,
    baseWidth = 300,
    autoplay = false,
    autoplayDelay = 3000,
    pauseOnHover = false,
    loop = false,
    round = false,
    renderItem,
    showArrows = false,
    arrowClassName = "",
  }: CarouselProps) => {
    const containerPadding = 16;
    const itemWidth = baseWidth - containerPadding * 2;
    const trackItemOffset = itemWidth + GAP;

    const itemsForRender = useMemo(() => {
      if (!loop) return items;
      if (items.length === 0) return [];
      return [items[items.length - 1], ...items, items[0]];
    }, [items, loop]);

    const startingPosition = loop ? 1 : 0;
    const [position, setPosition] = useState<number>(startingPosition);
    const x = useMotionValue(-startingPosition * trackItemOffset);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isJumping, setIsJumping] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Optimized event handlers
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    useEffect(() => {
      if (pauseOnHover && containerRef.current) {
        const container = containerRef.current;
        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          container.removeEventListener("mouseenter", handleMouseEnter);
          container.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    }, [pauseOnHover, handleMouseEnter, handleMouseLeave]);

    useEffect(() => {
      if (!autoplay || itemsForRender.length <= 1) return undefined;
      if (pauseOnHover && isHovered) return undefined;

      const timer = setInterval(() => {
        setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1));
      }, autoplayDelay);

      return () => clearInterval(timer);
    }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

    useEffect(() => {
      const startingPosition = loop ? 1 : 0;
      setPosition(startingPosition);
      x.set(-startingPosition * trackItemOffset);
    }, [items.length, loop, trackItemOffset, x]);

    useEffect(() => {
      if (!loop && position > itemsForRender.length - 1) {
        setPosition(Math.max(0, itemsForRender.length - 1));
      }
    }, [itemsForRender.length, loop, position]);

    const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

    const handleAnimationStart = useCallback(() => {
      setIsAnimating(true);
    }, []);

    const handleAnimationComplete = useCallback(() => {
      if (!loop || itemsForRender.length <= 1) {
        setIsAnimating(false);
        return;
      }
      const lastCloneIndex = itemsForRender.length - 1;

      if (position === lastCloneIndex) {
        setIsJumping(true);
        const target = 1;
        setPosition(target);
        x.set(-target * trackItemOffset);
        requestAnimationFrame(() => {
          setIsJumping(false);
          setIsAnimating(false);
        });
        return;
      }

      if (position === 0) {
        setIsJumping(true);
        const target = items.length;
        setPosition(target);
        x.set(-target * trackItemOffset);
        requestAnimationFrame(() => {
          setIsJumping(false);
          setIsAnimating(false);
        });
        return;
      }

      setIsAnimating(false);
    }, [loop, itemsForRender.length, position, items.length, trackItemOffset, x]);

    const handleDragEnd = useCallback(
      (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
        const getDragDirection = (offsetX: number, velocityX: number) => {
          if (offsetX < -DRAG_BUFFER || velocityX < -VELOCITY_THRESHOLD) return 1;
          if (offsetX > DRAG_BUFFER || velocityX > VELOCITY_THRESHOLD) return -1;
          return 0;
        };

        const direction = getDragDirection(info.offset.x, info.velocity.x);

        if (direction === 0) return;

        setPosition((prev) => {
          const next = prev + direction;
          const max = itemsForRender.length - 1;
          return Math.max(0, Math.min(next, max));
        });
      },
      [itemsForRender.length],
    );

    const dragProps = useMemo(
      () =>
        loop
          ? {}
          : {
              dragConstraints: {
                left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
                right: 0,
              },
            },
      [loop, trackItemOffset, itemsForRender.length],
    );

    const activeIndex = useMemo(() => {
      if (items.length === 0) return 0;
      if (loop) return (position - 1 + items.length) % items.length;
      return Math.min(position, items.length - 1);
    }, [items.length, loop, position]);

    const handlePrev = useCallback(() => {
      if (isAnimating) return;
      setPosition((prev) => {
        if (loop) return prev - 1;
        return Math.max(0, prev - 1);
      });
    }, [isAnimating, loop]);

    const handleNext = useCallback(() => {
      if (isAnimating) return;
      setPosition((prev) => {
        if (loop) return prev + 1;
        return Math.min(itemsForRender.length - 1, prev + 1);
      });
    }, [isAnimating, loop, itemsForRender.length]);

    const handleDotClick = useCallback(
      (index: number) => {
        if (isAnimating || position + 1 == index) return;
        setPosition(loop ? index + 1 : index);
      },
      [loop, isAnimating, position],
    );

    const wheelAccumulator = useRef(0);
    const lastWheelTime = useRef(0);
    const wheelCooldown = useRef(0);
    const wheelRef = useRef({ handleNext, handlePrev });

    useEffect(() => {
      wheelRef.current = { handleNext, handlePrev };
    }, [handleNext, handlePrev]);

    const handleWheel = useCallback((e: WheelEvent) => {
      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontalSwipe) {
        e.preventDefault();

        const now = Date.now();
        if (now - lastWheelTime.current > 400) {
          wheelAccumulator.current = 0;
        }
        lastWheelTime.current = now;

        if (now - wheelCooldown.current < 500) {
          return;
        }

        wheelAccumulator.current += e.deltaX;

        if (wheelAccumulator.current > 50) {
          wheelRef.current.handleNext();
          wheelCooldown.current = now;
          wheelAccumulator.current = 0;
        } else if (wheelAccumulator.current < -50) {
          wheelRef.current.handlePrev();
          wheelCooldown.current = now;
          wheelAccumulator.current = 0;
        }
      }
    }, []);

    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
          container.removeEventListener("wheel", handleWheel);
        };
      }
    }, [handleWheel]);

    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden p-4 ${
          round ? "rounded-full border border-white" : "rounded-[24px] border border-[#222]"
        }`}
        style={{
          width: `${baseWidth}px`,
          ...(round && { height: `${baseWidth}px` }),
        }}
      >
        <motion.div
          className="flex"
          drag={isAnimating ? false : "x"}
          {...dragProps}
          style={{
            width: itemWidth,
            gap: `${GAP}px`,
            perspective: 1000,
            perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
            x,
          }}
          onDragEnd={handleDragEnd}
          animate={{ x: -(position * trackItemOffset) }}
          transition={effectiveTransition}
          onAnimationStart={handleAnimationStart}
          onAnimationComplete={handleAnimationComplete}
        >
          <CarouselTrack
            itemsForRender={itemsForRender}
            renderItem={renderItem}
            itemWidth={itemWidth}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            effectiveTransition={effectiveTransition}
          />
        </motion.div>

        {showArrows && (
          <CarouselControls
            handlePrev={handlePrev}
            handleNext={handleNext}
            items={items}
            activeIndex={activeIndex}
            setPosition={handleDotClick}
            loop={loop}
            arrowClassName={arrowClassName}
          />
        )}

        {!showArrows && (
          <CarouselDots
            items={items}
            activeIndex={activeIndex}
            setPosition={handleDotClick}
            loop={loop}
            round={round}
          />
        )}
      </div>
    );
  },
);

Carousel.displayName = "Carousel";

export default Carousel;
