import { useEffect } from "react";
import Router from "next/router";
import useSWR from "swr";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
  adminOnly = false,
  warnedOnly = false,
  bannedOnly = false,
} = {}) {
  const { data: user, mutate: mutateUser } = useSWR("/api/user");

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;
    
    if (user?.permissions.banned) {
      Router.push("/banned");
    } else if (
      // If redirectTo is set, redirect if the user was not found
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn) ||
      // If redirectTo is set, redirect if the user is not an admin
      (redirectTo && adminOnly && !user?.permissions.admin) ||
      // If redirecTo is set, redirect if the user is not banned
      (redirectTo && bannedOnly && !user?.permissions.banned) ||
      // If redirecTo is set, redirect if the user is not warned
      (redirectTo && warnedOnly && !user?.permissions.warned)
    ) {
      Router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo, adminOnly, warnedOnly, bannedOnly]);

  return { user, mutateUser };
}
