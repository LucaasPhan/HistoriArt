import { gsap, useGSAP } from "@/lib/gsap";
import { RefObject, useRef } from "react";

const lerp = (a: number, b: number, n: number): number => (1 - n) * a + n * b;

const getMousePos = (e: Event, container?: HTMLElement | null): { x: number; y: number } => {
  const mouseEvent = e as MouseEvent;
  if (container) {
    const bounds = container.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - bounds.left,
      y: mouseEvent.clientY - bounds.top,
    };
  }
  return { x: mouseEvent.clientX, y: mouseEvent.clientY };
};

interface CrosshairProps {
  color?: string;
  lockedColor?: string;
  containerRef?: RefObject<HTMLElement>;
  lockSelector?: string;
}

const Crosshair: React.FC<CrosshairProps> = ({
  color = "white",
  lockedColor,
  containerRef = null,
  lockSelector,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const lineHorizontalRef = useRef<HTMLDivElement>(null);
  const lineVerticalRef = useRef<HTMLDivElement>(null);
  const filterXRef = useRef<SVGFETurbulenceElement>(null);
  const filterYRef = useRef<SVGFETurbulenceElement>(null);

  // Use a ref so the render loop can read the latest value without re-creating the effect
  const lockedRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  useGSAP(
    () => {
      const handleMouseMove = (ev: Event) => {
        const mouseEvent = ev as MouseEvent;
        mouseRef.current = getMousePos(mouseEvent, containerRef?.current);
        if (containerRef?.current) {
          const bounds = containerRef.current.getBoundingClientRect();
          if (
            mouseEvent.clientX < bounds.left ||
            mouseEvent.clientX > bounds.right ||
            mouseEvent.clientY < bounds.top ||
            mouseEvent.clientY > bounds.bottom
          ) {
            gsap.to([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), {
              opacity: 0,
            });
          } else {
            gsap.to([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), {
              opacity: 1,
            });
          }
        }
      };

      const target: HTMLElement | Window = containerRef?.current || window;
      target.addEventListener("mousemove", handleMouseMove);

      const renderedStyles: {
        [key: string]: { previous: number; current: number; amt: number };
      } = {
        tx: { previous: 0, current: 0, amt: 0.15 },
        ty: { previous: 0, current: 0, amt: 0.15 },
      };

      gsap.set([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), {
        opacity: 0,
      });

      const onMouseMove = () => {
        renderedStyles.tx.previous = renderedStyles.tx.current = mouseRef.current.x;
        renderedStyles.ty.previous = renderedStyles.ty.current = mouseRef.current.y;

        gsap.to([lineHorizontalRef.current, lineVerticalRef.current].filter(Boolean), {
          duration: 0.9,
          ease: "Power3.easeOut",
          opacity: 1,
        });

        requestAnimationFrame(render);

        target.removeEventListener("mousemove", onMouseMove);
      };

      target.addEventListener("mousemove", onMouseMove);

      const primitiveValues = { turbulence: 0 };

      const tl = gsap
        .timeline({
          paused: true,
          onStart: () => {
            if (lineHorizontalRef.current) {
              lineHorizontalRef.current.style.filter = "url(#filter-noise-x)";
            }
            if (lineVerticalRef.current) {
              lineVerticalRef.current.style.filter = "url(#filter-noise-y)";
            }
          },
          onUpdate: () => {
            if (filterXRef.current && filterYRef.current) {
              filterXRef.current.setAttribute(
                "baseFrequency",
                primitiveValues.turbulence.toString(),
              );
              filterYRef.current.setAttribute(
                "baseFrequency",
                primitiveValues.turbulence.toString(),
              );
            }
          },
          onComplete: () => {
            if (lineHorizontalRef.current && lineVerticalRef.current) {
              lineHorizontalRef.current.style.filter = "none";
              lineVerticalRef.current.style.filter = "none";
            }
          },
        })
        .to(primitiveValues, {
          duration: 0.5,
          ease: "power1",
          startAt: { turbulence: 1 },
          turbulence: 0,
        });

      const enter = () => tl.restart();
      const leave = () => {
        tl.progress(1).kill();
      };

      /* ── Lock helpers: freeze crosshair position when hovering lock targets ── */
      const activeLockedColor = lockedColor || color;

      const lockEnter = () => {
        lockedRef.current = true;
        // Visual feedback: color shift + turbulence
        if (lineHorizontalRef.current) {
          lineHorizontalRef.current.style.background = activeLockedColor;
          lineHorizontalRef.current.style.height = "2px";
          lineHorizontalRef.current.style.boxShadow = `0 0 8px ${activeLockedColor}`;
        }
        if (lineVerticalRef.current) {
          lineVerticalRef.current.style.background = activeLockedColor;
          lineVerticalRef.current.style.width = "2px";
          lineVerticalRef.current.style.boxShadow = `0 0 8px ${activeLockedColor}`;
        }
        tl.restart();
      };

      const lockLeave = () => {
        lockedRef.current = false;
        // Reset visual
        if (lineHorizontalRef.current) {
          lineHorizontalRef.current.style.background = color;
          lineHorizontalRef.current.style.height = "1px";
          lineHorizontalRef.current.style.boxShadow = "none";
        }
        if (lineVerticalRef.current) {
          lineVerticalRef.current.style.background = color;
          lineVerticalRef.current.style.width = "1px";
          lineVerticalRef.current.style.boxShadow = "none";
        }
      };

      const render = () => {
        renderedStyles.tx.current = mouseRef.current.x;
        renderedStyles.ty.current = mouseRef.current.y;

        for (const key in renderedStyles) {
          const style = renderedStyles[key];
          style.previous = lerp(style.previous, style.current, style.amt);
        }

        if (lineHorizontalRef.current && lineVerticalRef.current) {
          gsap.set(lineVerticalRef.current, { x: renderedStyles.tx.previous });
          gsap.set(lineHorizontalRef.current, { y: renderedStyles.ty.previous });
        }

        requestAnimationFrame(render);
      };

      /* ── Link hover turbulence (original behaviour) ── */
      const links: NodeListOf<HTMLAnchorElement> = containerRef?.current
        ? containerRef.current.querySelectorAll("a")
        : document.querySelectorAll("a");

      links.forEach((link) => {
        link.addEventListener("mouseenter", enter);
        link.addEventListener("mouseleave", leave);
      });

      /* ── Lock-selector: observe for dynamically added elements ── */
      const trackedLockEls = new Set<Element>();

      const bindLockElement = (el: Element) => {
        if (trackedLockEls.has(el)) return;
        trackedLockEls.add(el);
        el.addEventListener("mouseenter", lockEnter);
        el.addEventListener("mouseleave", lockLeave);
      };

      const unbindLockElement = (el: Element) => {
        if (!trackedLockEls.has(el)) return;
        trackedLockEls.delete(el);
        el.removeEventListener("mouseenter", lockEnter);
        el.removeEventListener("mouseleave", lockLeave);
      };

      let observer: MutationObserver | null = null;

      if (lockSelector) {
        const root = containerRef?.current || document.body;

        // Bind existing elements
        root.querySelectorAll(lockSelector).forEach(bindLockElement);

        // Watch for new elements (deals are dynamically spawned)
        observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof Element) {
                if (node.matches(lockSelector)) bindLockElement(node);
                node.querySelectorAll(lockSelector).forEach(bindLockElement);
              }
            });
            mutation.removedNodes.forEach((node) => {
              if (node instanceof Element) {
                if (node.matches(lockSelector)) unbindLockElement(node);
                node.querySelectorAll(lockSelector).forEach(unbindLockElement);
              }
            });
          }
        });

        observer.observe(root, { childList: true, subtree: true });
      }

      return () => {
        target.removeEventListener("mousemove", handleMouseMove);
        target.removeEventListener("mousemove", onMouseMove);
        links.forEach((link) => {
          link.removeEventListener("mouseenter", enter);
          link.removeEventListener("mouseleave", leave);
        });
        trackedLockEls.forEach((el) => {
          el.removeEventListener("mouseenter", lockEnter);
          el.removeEventListener("mouseleave", lockLeave);
        });
        trackedLockEls.clear();
        if (observer) observer.disconnect();
      };
    },
    { scope: cursorRef, dependencies: [containerRef, lockSelector, color, lockedColor] },
  );

  return (
    <div
      ref={cursorRef}
      className={`${containerRef ? "absolute" : "fixed"} pointer-events-none top-0 left-0 z-10000 h-full w-full`}
    >
      <svg className="absolute top-0 left-0 h-full w-full">
        <defs>
          <filter id="filter-noise-x">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
              ref={filterXRef}
            />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
          <filter id="filter-noise-y">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.000001"
              numOctaves="1"
              ref={filterYRef}
            />
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
      </svg>
      <div
        ref={lineHorizontalRef}
        className={`pointer-events-none absolute h-px w-full translate-y-1/2 transform opacity-0`}
        style={{
          background: color,
          transition: "background 0.2s, height 0.2s, box-shadow 0.2s",
        }}
      ></div>
      <div
        ref={lineVerticalRef}
        className={`pointer-events-none absolute h-full w-px translate-x-1/2 transform opacity-0`}
        style={{
          background: color,
          transition: "background 0.2s, width 0.2s, box-shadow 0.2s",
        }}
      ></div>
    </div>
  );
};

export default Crosshair;
