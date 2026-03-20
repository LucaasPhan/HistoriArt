/* eslint-disable @typescript-eslint/no-explicit-any */
import { MotionValue } from "motion/react";
import { ReactNode } from "react";

export interface CarouselItem {
  title: string;
  description: string;
  id: number;
  icon: ReactNode;
}

export interface CarouselProps {
  items?: any[]; // Relaxed type to allow custom items
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
  renderItem?: (props: CarouselItemProps) => ReactNode;
  showArrows?: boolean;
  arrowClassName?: string;
}

export interface CarouselItemProps {
  item: any;
  index: number;
  itemWidth: number;
  round: boolean;
  trackItemOffset: number;
  x: MotionValue<number>;
  transition: any;
}
