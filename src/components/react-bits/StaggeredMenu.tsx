/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransitionLink as Link } from "@/components/TransitionLink";
import { useIsMobile } from "@/hooks/useMobile";
import { usePreventBodyScroll } from "@/hooks/usePreventBodyScroll";
import { gsap, useGSAP } from "@/lib/gsap";
import { ChevronDown } from "lucide-react";
import { memo, useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  children?: StaggeredMenuItem[];
}
export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}
export interface StaggeredMenuProps {
  open: boolean;
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  accentColor?: string;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuClose?: () => void;
}

// Collapsible Menu Item Component
const CollapsibleMenuItem = memo(
  ({
    item,
    idx,
    onMenuClose,
    menuOpen,
  }: {
    item: StaggeredMenuItem;
    idx: number;
    onMenuClose?: () => void;
    menuOpen: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const childrenRef = useRef<HTMLUListElement>(null);
    const chevronRef = useRef<SVGSVGElement>(null);
    const animationRef = useRef<gsap.core.Timeline | null>(null);
    const closeCollapsibleEffectEvent = useEffectEvent(() => {
      setIsOpen(false);
    });

    // Reset collapsible state when main menu opens
    useEffect(() => {
      if (menuOpen) {
        closeCollapsibleEffectEvent();
        // Reset GSAP states immediately
        if (contentRef.current) {
          gsap.set(contentRef.current, { height: 0, opacity: 0 });
        }
        if (childrenRef.current) {
          const children = childrenRef.current.querySelectorAll("li");
          gsap.set(children, { x: -20, opacity: 0 });
        }
        if (chevronRef.current) {
          gsap.set(chevronRef.current, { rotation: 0 });
        }
      }
    }, [menuOpen]);

    useEffect(() => {
      if (!contentRef.current || !childrenRef.current) return;

      const content = contentRef.current;
      const children = childrenRef.current.querySelectorAll("li");
      const chevron = chevronRef.current;

      // Kill any existing animation
      animationRef.current?.kill();

      if (isOpen) {
        // Opening animation
        const tl = gsap.timeline();
        animationRef.current = tl;

        // Set initial states
        gsap.set(content, { height: 0, opacity: 0 });
        gsap.set(children, { x: -20, opacity: 0 });

        tl.to(content, {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
        })
          .to(
            chevron,
            {
              rotation: 180,
              duration: 0.3,
              ease: "power2.out",
            },
            0,
          )
          .to(
            children,
            {
              x: 0,
              opacity: 1,
              duration: 0.35,
              stagger: 0.06,
              ease: "power3.out",
            },
            0.15,
          );
      } else {
        // Closing animation
        const tl = gsap.timeline();
        animationRef.current = tl;

        tl.to(children, {
          x: -10,
          opacity: 0,
          duration: 0.2,
          stagger: { each: 0.03, from: "end" },
          ease: "power2.in",
        })
          .to(
            chevron,
            {
              rotation: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            0,
          )
          .to(
            content,
            {
              height: 0,
              opacity: 0,
              duration: 0.3,
              ease: "power3.inOut",
            },
            0.1,
          );
      }

      return () => {
        animationRef.current?.kill();
      };
    }, [isOpen]);

    if (item.children && item.children.length > 0) {
      return (
        <li className="sm-panel-itemWrap relative overflow-hidden leading-none">
          <button
            className="sm-panel-item relative inline-flex w-full cursor-pointer items-center gap-2 py-3 pr-[1.4em] text-left text-[2rem] leading-none font-semibold tracking-[-2px] text-black uppercase no-underline transition-[background,color] duration-150 ease-linear hover:text-[#0084ff]! dark:text-white"
            data-index={idx + 1}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">
              {item.label}
            </span>
            <ChevronDown
              ref={chevronRef}
              className="h-6 w-6"
              style={{ transformOrigin: "center" }}
            />
          </button>
          <div ref={contentRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
            <ul
              ref={childrenRef}
              className="mt-2 mb-4 ml-2 flex flex-col gap-1 border-l-2 border-[#0084ff]/30 pl-4 dark:border-[#0084ff]/50"
            >
              {item.children.map((child, childIdx) => (
                <li
                  key={child.label + childIdx}
                  className="overflow-hidden"
                  style={{ opacity: 0, transform: "translateX(-20px)" }}
                >
                  <Link
                    href={child.link}
                    className="inline-block cursor-pointer py-2 text-lg font-medium text-black/70 no-underline transition-colors duration-150 ease-linear hover:text-[#0084ff] dark:text-white/70 dark:hover:text-[#0084ff]"
                    onClick={() => onMenuClose?.()}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
      );
    }

    return (
      <li className="sm-panel-itemWrap relative overflow-hidden leading-none">
        <Link
          className="sm-panel-item relative inline-block cursor-pointer py-3 pr-[1.4em] text-[2rem] leading-none font-semibold tracking-[-2px] text-black uppercase no-underline transition-[background,color] duration-150 ease-linear hover:text-[#0084ff]! dark:text-white"
          href={item.link}
          aria-label={item.ariaLabel}
          data-index={idx + 1}
          onClick={() => onMenuClose?.()}
        >
          <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">
            {item.label}
          </span>
        </Link>
      </li>
    );
  },
);

CollapsibleMenuItem.displayName = "CollapsibleMenuItem";

export const StaggeredMenu: React.FC<StaggeredMenuProps> = memo(
  ({
    open,
    position = "right",
    colors = ["#E6F2FF", "#0084FF"],
    items = [],
    socialItems = [],
    displaySocials = true,
    displayItemNumbering = true,
    className,
    accentColor = "#0084FF",
    isFixed = true,
    closeOnClickAway = true,
    onMenuClose,
  }: StaggeredMenuProps) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const preLayersRef = useRef<HTMLDivElement | null>(null);
    const preLayerElsRef = useRef<HTMLElement[]>([]);
    const openTlRef = useRef<gsap.core.Timeline | null>(null);
    const closeTweenRef = useRef<gsap.core.Tween | null>(null);
    const busyRef = useRef(false);
    const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

    const isMobile = useIsMobile();

    usePreventBodyScroll(open && isMobile);

    useGSAP(
      () => {
        const panel = panelRef.current;
        const preContainer = preLayersRef.current;

        if (!panel) return;

        let preLayers: HTMLElement[] = [];
        if (preContainer) {
          preLayers = Array.from(preContainer.querySelectorAll(".sm-prelayer")) as HTMLElement[];
        }
        preLayerElsRef.current = preLayers;

        const offscreen = position === "left" ? -100 : 100;
        gsap.set([panel, ...preLayers], { xPercent: offscreen });

        // Ensure hidden items are reset
        const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
      },
      { dependencies: [position] },
    );

    const buildOpenTimeline = useCallback(() => {
      const panel = panelRef.current;
      const layers = preLayerElsRef.current;
      if (!panel) return null;

      openTlRef.current?.kill();
      if (closeTweenRef.current) {
        closeTweenRef.current.kill();
        closeTweenRef.current = null;
      }
      itemEntranceTweenRef.current?.kill();

      const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
      const numberEls = Array.from(
        panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"),
      ) as HTMLElement[];
      const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
      const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link")) as HTMLElement[];

      const layerStates = layers.map((el) => ({
        el,
        start: Number(gsap.getProperty(el, "xPercent")),
      }));
      const panelStart = Number(gsap.getProperty(panel, "xPercent"));

      if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
      if (numberEls.length) gsap.set(numberEls, { ["--sm-num-opacity" as any]: 0 });
      if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
      if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

      const tl = gsap.timeline({ paused: true });

      layerStates.forEach((ls, i) => {
        tl.fromTo(
          ls.el,
          { xPercent: ls.start },
          { xPercent: 0, duration: 0.5, ease: "power4.out" },
          i * 0.07,
        );
      });

      const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
      const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
      const panelDuration = 0.65;

      tl.fromTo(
        panel,
        { xPercent: panelStart },
        { xPercent: 0, duration: panelDuration, ease: "power4.out" },
        panelInsertTime,
      );

      if (itemEls.length) {
        const itemsStartRatio = 0.15;
        const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

        tl.to(
          itemEls,
          {
            yPercent: 0,
            rotate: 0,
            duration: 1,
            ease: "power4.out",
            stagger: { each: 0.1, from: "start" },
          },
          itemsStart,
        );

        if (numberEls.length) {
          tl.to(
            numberEls,
            {
              duration: 0.6,
              ease: "power2.out",
              ["--sm-num-opacity" as any]: 1,
              stagger: { each: 0.08, from: "start" },
            },
            itemsStart + 0.1,
          );
        }
      }

      if (socialTitle || socialLinks.length) {
        const socialsStart = panelInsertTime + panelDuration * 0.4;

        if (socialTitle)
          tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, socialsStart);
        if (socialLinks.length) {
          tl.to(
            socialLinks,
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              ease: "power3.out",
              stagger: { each: 0.08, from: "start" },
              onComplete: () => {
                gsap.set(socialLinks, { clearProps: "opacity" });
              },
            },
            socialsStart + 0.04,
          );
        }
      }

      openTlRef.current = tl;
      return tl;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position]);

    const playOpen = useCallback(() => {
      busyRef.current = true;
      const tl = buildOpenTimeline();
      if (tl) {
        tl.eventCallback("onComplete", () => {
          busyRef.current = false;
        });
        tl.play(0);
      } else {
        busyRef.current = false;
      }
    }, [buildOpenTimeline]);

    const playClose = useCallback(() => {
      openTlRef.current?.kill();
      openTlRef.current = null;
      itemEntranceTweenRef.current?.kill();

      const panel = panelRef.current;
      const layers = preLayerElsRef.current;
      if (!panel) return;

      const all: HTMLElement[] = [...layers, panel];
      closeTweenRef.current?.kill();

      const offscreen = position === "left" ? -100 : 100;

      closeTweenRef.current = gsap.to(all, {
        xPercent: offscreen,
        duration: 0.32,
        ease: "power3.in",
        overwrite: "auto",
        onComplete: () => {
          const itemEls = Array.from(
            panel.querySelectorAll(".sm-panel-itemLabel"),
          ) as HTMLElement[];
          if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

          const numberEls = Array.from(
            panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"),
          ) as HTMLElement[];
          if (numberEls.length) gsap.set(numberEls, { ["--sm-num-opacity" as any]: 0 });

          const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
          const socialLinks = Array.from(
            panel.querySelectorAll(".sm-socials-link"),
          ) as HTMLElement[];
          if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
          if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

          busyRef.current = false;
        },
      });
    }, [position]);

    useEffect(() => {
      if (open) {
        playOpen();
      } else {
        playClose();
      }
    }, [open, playOpen, playClose]);

    useEffect(() => {
      if (!closeOnClickAway || !open) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        // Check if click is on theme toggle button
        const themeToggle = document.querySelector('[aria-label="Toggle theme"]');
        const isThemeToggleClick = themeToggle?.contains(target);
        // Check if click is on mobile menu button
        const openMenuBtn = document.querySelector('[aria-label="Open menu"]');
        const closeMenuBtn = document.querySelector('[aria-label="Close menu"]');
        const isUserMenuClick = (target as Element).closest("[data-radix-popper-content-wrapper]");
        const focusGuard = (target as Element).closest("[data-radix-focus-guard]");
        const usermenuTrigger = (target as Element).closest('[data-slot="dropdown-menu-trigger"]');

        const isMenuButtonClick = openMenuBtn?.contains(target) || closeMenuBtn?.contains(target);

        if (
          panelRef.current &&
          !panelRef.current.contains(target) &&
          target &&
          !isThemeToggleClick &&
          !isMenuButtonClick &&
          !isUserMenuClick &&
          !focusGuard &&
          !usermenuTrigger
        ) {
          onMenuClose?.();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [closeOnClickAway, open, onMenuClose]);

    return (
      <div
        className={`sm-scope z-200 ${isFixed ? "fixed top-0 right-0 h-dvh w-[330px] overflow-hidden" : "h-full w-[330px]"}`}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        <div
          className={
            (className ? className + " " : "") +
            "staggered-menu-wrapper relative z-40 h-full w-full"
          }
          style={
            accentColor
              ? ({ ["--sm-accent" as any]: accentColor } as React.CSSProperties)
              : undefined
          }
          data-position={position}
          data-open={open || undefined}
        >
          <div
            ref={preLayersRef}
            className="sm-prelayers pointer-events-none absolute top-0 right-0 bottom-0 z-5"
            aria-hidden="true"
          >
            {(() => {
              const raw = colors && colors.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];
              const arr = [...raw];
              if (arr.length >= 3) {
                const mid = Math.floor(arr.length / 2);
                arr.splice(mid, 1);
              }
              return arr.map((c, i) => (
                <div
                  key={i}
                  className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0"
                  style={{ background: c }}
                />
              ));
            })()}
          </div>

          <ScrollArea
            id="staggered-menu-panel"
            ref={panelRef}
            type="always"
            className="staggered-menu-panel pointer-events-auto absolute top-0 right-0 z-10 flex h-full flex-col bg-white p-[6em_2em_2em_2em] backdrop-blur-md dark:bg-black"
            style={{ WebkitBackdropFilter: "blur(12px)" }}
            aria-hidden={!open}
            data-lenis-prevent
          >
            <div className="sm-panel-inner flex flex-1 flex-col gap-5">
              <ul
                className="sm-panel-list m-0 flex list-none flex-col gap-2 p-0"
                role="list"
                data-numbering={displayItemNumbering || undefined}
              >
                {items && items.length ? (
                  items.map((it, idx) => (
                    <CollapsibleMenuItem
                      key={it.label + idx}
                      item={it}
                      idx={idx}
                      onMenuClose={onMenuClose}
                      menuOpen={open}
                    />
                  ))
                ) : (
                  <li
                    className="sm-panel-itemWrap relative overflow-hidden leading-none"
                    aria-hidden="true"
                  >
                    <span className="sm-panel-item relative inline-block cursor-pointer pr-[1.4em] text-[4rem] leading-none font-semibold tracking-[-2px] text-black uppercase no-underline transition-[background,color] duration-150 ease-linear dark:text-white">
                      <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">
                        No items
                      </span>
                    </span>
                  </li>
                )}
              </ul>

              {displaySocials && socialItems && socialItems.length > 0 && (
                <div
                  className="sm-socials mt-auto flex flex-col gap-3 pt-8"
                  aria-label="Social links"
                >
                  <h3 className="sm-socials-title m-0 text-base font-medium text-(--sm-accent,#ff0000)">
                    Socials
                  </h3>
                  <ul
                    className="sm-socials-list m-0 flex list-none flex-row flex-wrap items-center gap-4 p-0"
                    role="list"
                  >
                    {socialItems.map((s, i) => (
                      <li key={s.label + i} className="sm-socials-item">
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sm-socials-link relative inline-block py-[2px] text-[0.5rem] font-medium text-[#111] no-underline transition-[color,opacity] duration-300 ease-linear"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: 100%); height: 100%; background: white; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; padding: 6em 2em 2em 2em; overflow-y: auto; z-index: 10; }
:root.dark .sm-scope .staggered-menu-panel { background: black; }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(260px, 38vw, 420px); pointer-events: none; z-index: 5; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; transform: translateX(0); }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
.sm-scope .sm-socials { margin-top: auto; padding-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
.sm-scope .sm-socials-title { margin: 0; font-size: 1rem; font-weight: 500; color: var(--sm-accent, #ff0000); }
.sm-scope .sm-socials-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: row; align-items: center; gap: 1rem; flex-wrap: wrap; }
.sm-scope .sm-socials-list .sm-socials-link { opacity: 1; transition: opacity 0.3s ease; }
.sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.35; }
.sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) { opacity: 0.35; }
.sm-scope .sm-socials-list .sm-socials-link:hover,
.sm-scope .sm-socials-list .sm-socials-link:focus-visible { opacity: 1; }
.sm-scope .sm-socials-link:focus-visible { outline: 2px solid var(--sm-accent, #ff0000); outline-offset: 3px; }
.sm-scope .sm-socials-link { font-size: 0.67rem; font-weight: 500; color: #111; text-decoration: none; position: relative; padding: 2px 0; display: inline-block; transition: color 0.3s ease, opacity 0.3s ease; }
:root.dark .sm-scope .sm-socials-link { color: #eee; }
.sm-scope .sm-socials-link:hover { color: var(--sm-accent, #ff0000); }
.sm-scope .sm-panel-title { margin: 0; font-size: 1rem; font-weight: 600; color: #fff; text-transform: uppercase; }
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.sm-scope .sm-panel-item { position: relative; color: #000; font-weight: 600; font-size: 2rem; cursor: pointer; line-height: 1; letter-spacing: -2px; text-transform: uppercase; transition: background 0.25s, color 0.25s; display: flex; align-items: center; text-decoration: none; padding-right: .4em; }
:root.dark .sm-scope .sm-panel-item { color: #fff; }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-item:hover { color: var(--sm-accent, #ff0000); }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.1em; right: 3.2em; font-size: 18px; font-weight: 400; color: var(--sm-accent, #ff0000); letter-spacing: 0; pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); }
@media (max-width: 1024px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); } }
@media (max-width: 640px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); } }
      `}</style>
      </div>
    );
  },
);

StaggeredMenu.displayName = "StaggeredMenu";
export default StaggeredMenu;
