"use client";

import { TransitionLink as Link } from "@/components/TransitionLink";
import { useAuth } from "@/context/AuthContext";
import {
  authKeys,
  bookmarkKeys,
  userFinishedQuestionsKeys,
  userRecentQueryKeys,
} from "@/context/queryKeys";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Cog,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  RefreshCcw,
  ShieldCheck,
  SquareUserRound,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "./ThemeProvider";
// GlareHover removed (react-bits cleanup)
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

const UnauthenticatedUser = () => {
  const { t } = useTranslation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <Link href="/login">
          <Button
            style={{
              height: "36px",
              padding: "0 20px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <SquareUserRound size={16} />
            <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>{t("user.signIn")}</span>
          </Button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

const User = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isSessionPending, isSessionError, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const menuItemClass =
    "data-[highlighted]:bg-muted flex w-full cursor-pointer items-center justify-start gap-2 pl-1! px-2 py-2 rounded-sm text-sm font-normal";

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: isAuthenticated && !!user,
  });

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user?.name || "User";

  const nameParts = displayName.split(" ").filter(Boolean);
  const initials =
    nameParts.length > 1
      ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
      : nameParts[0]?.[0] || "U";

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null);
      queryClient.setQueryData(bookmarkKeys.all, null);
      queryClient.setQueryData(userRecentQueryKeys.all, null);
      queryClient.setQueryData(userFinishedQuestionsKeys.all, null);
      setIsMenuOpen(false);
      router.push("/login");
    },
    onError: () => {
      toast.error("Error signing out, please try again.");
    },
  });

  const handleSignOut = useCallback(() => {
    signOutMutation.mutate();
  }, [signOutMutation]);

  if (isSessionError) {
    return (
      <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            className="cursor-pointer rounded-lg bg-red-600 text-white hover:bg-red-600 hover:opacity-90"
            title="Error fetching data, please refresh"
          >
            <AlertTriangle />
            {t("user.errorTitle")}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="text-foreground relative z-100001 flex flex-col bg-(--bg-card) px-0">
          <DropdownMenuItem asChild>
            <Button
              className="hover:bg-muted w-full cursor-pointer px-4 py-2"
              onClick={() => {
                setIsMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
              variant="ghost"
            >
              {t("user.errorRefresh")}
              <RefreshCcw />
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isSessionPending) {
    return (
      <Skeleton
        style={{
          height: "32px",
          width: "32px",
          borderRadius: "var(--radius-full)",
          background: "var(--bg-tertiary)",
        }}
      />
    );
  }
  if (!isAuthenticated || !user) {
    return <UnauthenticatedUser />;
  }
  return (
    <>
      <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen} modal={false}>
        <DropdownMenuTrigger
          style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={user.image}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Avatar>
                <div
                  style={{ position: "relative", zIndex: 1, borderRadius: "var(--radius-full)" }}
                  title="Account Settings"
                >
                  <AvatarImage src={user.image || "/assets/avatar/blue.webp"} />
                  <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
                </div>
              </Avatar>
            </motion.div>
          </AnimatePresence>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          style={{
            position: "relative",
            zIndex: 100001,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "var(--bg-card)",
            padding: "8px",
            width: "200px",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "8px",
              padding: "8px 12px",
            }}
          >
            <Avatar>
              <AvatarImage
                src={user.image || "/assets/avatar/blue.webp"}
                style={{ border: "none" }}
              />
              <AvatarFallback style={{ border: "none" }}>{initials.toUpperCase()}</AvatarFallback>
            </Avatar>
            <p
              style={{
                margin: 0,
                maxWidth: "120px",
                fontSize: "14px",
                fontWeight: 500,
                whiteSpace: "pre-line",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </p>
          </div>

          <DropdownMenuItem
            style={{
              display: "flex",
              width: "100%",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "14px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            onSelect={(e) => {
              e.preventDefault();
              toggleTheme();
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? t("user.lightMode") : t("user.darkMode")}
          </DropdownMenuItem>

          <DropdownMenuItem
            style={{
              display: "flex",
              width: "100%",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "14px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard size={16} />
            {t("nav.dashboard")}
          </DropdownMenuItem>

          {user?.role === "admin" && (
            <DropdownMenuItem
              style={{
                display: "flex",
                width: "100%",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => router.push("/admin")}
            >
              <ShieldCheck size={16} />
              {t("nav.admin")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            style={{
              display: "flex",
              width: "100%",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "14px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            onClick={() => router.push("/settings")}
          >
            <Cog size={16} />
            {t("user.settings")}
          </DropdownMenuItem>

          <DropdownMenuItem
            style={{
              display: "flex",
              width: "100%",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "14px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            onSelect={(e) => {
              e.preventDefault();
              setIsMenuOpen(true);
            }}
            onClick={handleSignOut}
            disabled={signOutMutation.isPending}
          >
            {signOutMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t("user.signingOut")}
              </>
            ) : (
              <>
                <LogOut size={16} />
                {t("user.signOut")}
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
});

UnauthenticatedUser.displayName = "UnauthenticatedUser";
User.displayName = "User";

export default User;
