"use client";

import { useEffect } from "react";

export default function PageMountSignaler() {
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("page-mount-complete"));
    }, 0);
  }, []);
  return null;
}
