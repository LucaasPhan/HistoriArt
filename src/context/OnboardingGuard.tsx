"use client";

export function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
  onboardingComplete?: boolean;
}) {
  // Onboarding removed — always render children
  return <>{children}</>;
}
