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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Loader2,
  LogOut,
  RefreshCcw,
  SquareUserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import GlareHover from "./react-bits/GlareHover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

const UnauthenticatedUser = () => {
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
            <span className="font-semibold tracking-wide">Sign In</span>
          </Button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

const User = memo(
  () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isSessionPending, isSessionError, isAuthenticated } = useAuth();

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
              Error
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="bg-(--bg-card) text-foreground relative z-100001 flex flex-col px-0">
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
                Refresh
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
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                <Avatar>
                  <GlareHover
                    glareAngle={-30}
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    glareSize={300}
                    playOnce={false}
                    title="Account Settings"
                    transitionDuration={800}
                    className="z-1 rounded-full"
                  >
                    <AvatarImage
                      className="h-[32px] w-[32px]"
                      src={user.image || "/assets/avatar/blue.webp"}
                    />
                    <AvatarFallback className="h-[32px] w-[32px]">
                      {user.name.split(" ")[0]?.charAt(0) + user.name.split(" ")[1]?.charAt(0)}
                    </AvatarFallback>
                  </GlareHover>
                </Avatar>
              </motion.div>
            </AnimatePresence>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-(--bg-card) text-foreground p-2! relative z-100001 flex w-[200px] flex-col px-1"
          >
            <div className="flex w-full items-center justify-start gap-2 px-4 py-2">
              <Avatar>
                <AvatarImage
                  className="h-[32px] w-[32px] border-0!"
                  src={user.image || "/assets/avatar/blue.webp"}
                />
                <AvatarFallback className="h-[32px] w-[32px] border-0!">
                  {user.name.split(" ")[0]?.charAt(0) + user.name.split(" ")[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="w-max max-w-[120px] text-sm font-medium whitespace-pre-line">
                {user.name}
              </p>
            </div>

            <DropdownMenuSeparator className="mx-0! my-0!" />

            <DropdownMenuItem
              asChild
              onSelect={(e) => {
                e.preventDefault();
                setIsMenuOpen(true);
              }}
              title="Sign out"
            >
              <Button
                className="hover:bg-muted flex w-full cursor-pointer items-center justify-start px-2 py-2"
                onClick={handleSignOut}
                size="icon"
                variant="ghost"
              >
                {signOutMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut />
                    Sign out
                  </>
                )}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  },
);

UnauthenticatedUser.displayName = "UnauthenticatedUser";
User.displayName = "User";

export default User;
