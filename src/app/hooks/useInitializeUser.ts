import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useInitializeUser() {
  const { userId } = useAuth();
  const { user } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (userId && user) {
      upsertUser({
        clerkId: userId,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "Anonymous",
        imageUrl: user.imageUrl || "",
      });
    }
  }, [userId, user, upsertUser]);
}
