"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

export function OnboardingGuard({
  children,
  onboardingComplete,
}: {
  children: React.ReactNode;
  onboardingComplete?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSessionPending, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isSessionPending) return;

    if (isAuthenticated && !onboardingComplete) {
      if (!pathname.startsWith("/onboarding")) {
        router.replace("/onboarding");
      }
    }
  }, [isAuthenticated, onboardingComplete, pathname, router, isSessionPending]);

  return <>{children}</>;
}
