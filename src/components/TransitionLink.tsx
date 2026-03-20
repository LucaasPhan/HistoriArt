"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

interface TransitionLinkProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  target?: string;
  href: string; // Ensure href is explicit string here for simplicity
  ref?: React.Ref<HTMLDivElement>;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const GlobalNavigationHandler = () => {
  const [data, setData] = useState<{ href: string; target?: string } | null>(null);
  const ref = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string; target?: string }>;
      setData(customEvent.detail);
    };
    window.addEventListener("trigger-nextjs-nav", handleTrigger);
    return () => window.removeEventListener("trigger-nextjs-nav", handleTrigger);
  }, []);

  useEffect(() => {
    const handleNavigate = async () => {
      if (data && ref.current) {
        ref.current.click();
        await sleep(700);
        router.push(data.href);
        // Reset after click using raF to avoid cascading renders warning
        requestAnimationFrame(() => {
          setData(null);
        });
      }
    };
    handleNavigate();
  }, [data, router]);

  if (!data) return null;

  return (
    <Link
      href={data.href}
      onClick={(e) => e.preventDefault()}
      target={data.target}
      ref={ref}
      className="hidden"
      aria-hidden="true"
    />
  );
};

export const useTransitionNavigate = () => {
  const pathname = usePathname();

  const navigate = useCallback(
    async ({
      href,
      target,
      e,
    }: {
      href: string;
      target?: string;
      e?: React.MouseEvent | MouseEvent;
    }) => {
      const hrefStr = href.toString();

      const triggerNav = async () => {
        window.dispatchEvent(
          new CustomEvent("trigger-nextjs-nav", {
            detail: { href: hrefStr, target },
          }),
        );
        window.dispatchEvent(new Event("trigger-exit"));
      };

      // Don't intercept if cmd/ctrl clicked, or has external target
      if (target === "_blank" || (e && (e.ctrlKey || e.metaKey || e.shiftKey))) {
        return;
      }

      // Pre-emptively prevent default if we're going to handle it with a transition
      if (e) e.preventDefault();

      // Handle special protocols, hash links, or current page
      if (
        hrefStr.startsWith("#") ||
        hrefStr.startsWith("mailto:") ||
        hrefStr.startsWith("tel:") ||
        pathname === hrefStr ||
        hrefStr === pathname + "/"
      ) {
        return;
      }

      await triggerNav();
    },
    [pathname],
  );

  return navigate;
};

export const TransitionLink = memo(
  ({
    children,
    href,
    className,
    onClick,
    target,
    ref: externalRef,
    ...props
  }: TransitionLinkProps) => {
    const navigate = useTransitionNavigate();

    const handleTransition = async (e: React.MouseEvent<HTMLDivElement>) => {
      // If there's a custom onClick, fire it
      if (onClick) onClick(e);
      await navigate({ href: href.toString(), target, e });
    };

    return (
      <div
        className={cn("cursor-pointer", className)}
        onClick={handleTransition}
        ref={externalRef}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TransitionLink.displayName = "TransitionLink";
