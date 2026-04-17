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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Cog,
  Loader2,
  LogOut,
  Moon,
  RefreshCcw,
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
            className="btn-primary flex items-center justify-center gap-2"
            style={{ height: "36px", padding: "0 20px", fontSize: "14px" }}
          >
            <SquareUserRound className="h-4 w-4" />
            <span className="font-semibold tracking-wide">{t("user.signIn")}</span>
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

  const displayName = profile?.firstName && profile?.lastName
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
    return <Skeleton className="bg-navbar-skelenton! h-8 w-8 rounded-full" />;
  }
  if (!isAuthenticated || !user) {
    return <UnauthenticatedUser />;
  }
  return (
    <>
      <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen} modal={false}>
        <DropdownMenuTrigger>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={user.image}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Avatar>
                <div className="z-1 rounded-full" title="Account Settings">
                  <AvatarImage
                    className="h-[32px] w-[32px]"
                    src={user.image || "/assets/avatar/blue.webp"}
                  />
                  <AvatarFallback className="h-[32px] w-[32px]">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                </div>
              </Avatar>
            </motion.div>
          </AnimatePresence>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="text-foreground relative z-100001 flex w-[200px] flex-col gap-3! bg-(--bg-card) p-2! px-1"
        >
          <div className="flex w-full items-center justify-start gap-2 px-4 py-2">
            <Avatar>
              <AvatarImage
                className="h-[32px] w-[32px] border-0!"
                src={user.image || "/assets/avatar/blue.webp"}
              />
              <AvatarFallback className="h-[32px] w-[32px] border-0!">
                {initials.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="w-max max-w-[120px] text-sm font-medium whitespace-pre-line truncate">
              {displayName}
            </p>
          </div>

          <DropdownMenuItem
            className={menuItemClass}
            onSelect={(e) => {
              e.preventDefault();
              toggleTheme();
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? t("user.lightMode") : t("user.darkMode")}
          </DropdownMenuItem>

          <DropdownMenuItem className={menuItemClass} onClick={() => router.push("/settings")}>
            <Cog size={16} />
            {t("user.settings")}
          </DropdownMenuItem>

          <DropdownMenuItem
            className={menuItemClass + " mb-2!"}
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
