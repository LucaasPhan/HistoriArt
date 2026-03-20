/* eslint-disable sonarjs/cognitive-complexity */
import ReactLenis, { useLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card relative my-8 box-border h-80 w-full origin-top rounded-[40px] p-2 shadow-[0_0_30px_rgba(0,0,0,0.1)] will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const cardsRef = useRef<HTMLElement[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTransformsRef = useRef(new Map<number, any>());

  // Cache card offsets so we don't call getBoundingClientRect every frame
  const cardOffsetsRef = useRef<number[]>([]);
  const endOffsetRef = useRef<number>(0);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getContainerHeight = useCallback(() => {
    if (useWindowScroll) {
      return window.innerHeight;
    }
    return scrollerRef.current ? scrollerRef.current.clientHeight : 0;
  }, [useWindowScroll]);

  // Measure and cache all card offsets (call only on layout, not every frame)
  const measureOffsets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    const offsets: number[] = [];
    cards.forEach((card) => {
      if (useWindowScroll) {
        const rect = card.getBoundingClientRect();
        offsets.push(rect.top + window.scrollY);
      } else {
        offsets.push(card.offsetTop);
      }
    });
    cardOffsetsRef.current = offsets;

    const endElement = useWindowScroll
      ? (document.querySelector(".scroll-stack-end") as HTMLElement | null)
      : (scrollerRef.current?.querySelector(".scroll-stack-end") as HTMLElement | null);

    if (endElement) {
      if (useWindowScroll) {
        const rect = endElement.getBoundingClientRect();
        endOffsetRef.current = rect.top + window.scrollY;
      } else {
        endOffsetRef.current = endElement.offsetTop;
      }
    }
  }, [useWindowScroll]);

  // The main update function — takes scrollTop as a parameter to avoid reading stale values
  const updateCardTransforms = useCallback(
    (scrollTop: number) => {
      const cards = cardsRef.current;
      const offsets = cardOffsetsRef.current;
      if (!cards.length || offsets.length !== cards.length) return;

      const containerHeight = getContainerHeight();
      const stackPositionPx = parsePercentage(stackPosition, containerHeight);
      const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
      const endElementTop = endOffsetRef.current;

      cards.forEach((card, i) => {
        if (!card) return;

        const cardTop = offsets[i];
        const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPositionPx;
        const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
        const pinEnd = endElementTop - containerHeight / 2;

        const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
        const targetScale = baseScale + i * itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);
        const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

        let blur = 0;
        if (blurAmount) {
          let topCardIndex = 0;
          for (let j = 0; j < cards.length; j++) {
            const jCardTop = offsets[j];
            const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
            if (scrollTop >= jTriggerStart) {
              topCardIndex = j;
            }
          }

          if (i < topCardIndex) {
            const depthInStack = topCardIndex - i;
            blur = Math.max(0, depthInStack * blurAmount);
          }
        }

        let translateY = 0;
        const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

        if (isPinned) {
          translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
        }

        const newTransform = {
          translateY: Math.round(translateY * 100) / 100,
          scale: Math.round(scale * 1000) / 1000,
          rotation: Math.round(rotation * 100) / 100,
          blur: Math.round(blur * 100) / 100,
        };

        const lastTransform = lastTransformsRef.current.get(i);
        const hasChanged =
          !lastTransform ||
          Math.abs(lastTransform.translateY - newTransform.translateY) > 0.05 ||
          Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
          Math.abs(lastTransform.rotation - newTransform.rotation) > 0.05 ||
          Math.abs(lastTransform.blur - newTransform.blur) > 0.05;

        if (hasChanged) {
          const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
          const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";

          card.style.transform = transform;
          card.style.filter = filter;

          lastTransformsRef.current.set(i, newTransform);
        }

        if (i === cards.length - 1) {
          const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
          if (isInView && !stackCompletedRef.current) {
            stackCompletedRef.current = true;
            onStackComplete?.();
          } else if (!isInView && stackCompletedRef.current) {
            stackCompletedRef.current = false;
          }
        }
      });
    },
    [
      itemScale,
      itemStackDistance,
      stackPosition,
      scaleEndPosition,
      baseScale,
      rotationAmount,
      blurAmount,
      onStackComplete,
      calculateProgress,
      parsePercentage,
      getContainerHeight,
    ],
  );

  // useLenis gives us the Lenis instance on every frame — use its scroll value directly
  useLenis((lenis) => {
    updateCardTransforms(lenis.scroll);
  });

  useLayoutEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll(".scroll-stack-card")
        : (scrollerRef.current?.querySelectorAll(".scroll-stack-card") ?? []),
    ) as HTMLElement[];
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.webkitTransform = "translateZ(0)";
    });

    // Measure all positions once after layout
    measureOffsets();

    // Initial update
    const scrollTop = useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop ?? 0);
    updateCardTransforms(scrollTop);

    // Fully reset on resize: clear caches, reset styles, remeasure, and reapply
    const handleResize = () => {
      lastTransformsRef.current.clear();
      stackCompletedRef.current = false;

      cards.forEach((card) => {
        card.style.transform = "translateZ(0)";
        card.style.filter = "";
      });

      measureOffsets();

      const newScrollTop = useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop ?? 0);
      updateCardTransforms(newScrollTop);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      cardOffsetsRef.current = [];
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    updateCardTransforms,
    measureOffsets,
  ]);

  const lenisOptions = {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
    infinite: false,
    wheelMultiplier: 1,
    syncTouch: true,
    syncTouchLerp: 0.075,
  };

  return (
    <ReactLenis root={useWindowScroll} options={lenisOptions}>
      <div
        className={`relative h-full w-full overflow-x-visible overflow-y-auto ${className}`.trim()}
        ref={scrollerRef}
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
        }}
      >
        <div className="scroll-stack-inner min-h-screen px-6 pt-4 pb-150">
          {children}
          {/* Spacer so the last pin can release cleanly */}
          <div className="scroll-stack-end h-px w-full" />
        </div>
      </div>
    </ReactLenis>
  );
};

export default ScrollStack;
