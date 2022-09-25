import useSWR from "swr";

export default function useAdminUsers(user) {
  // We do a request to /api/events only if the user is logged in
  const { data: users } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/admin/users?sort=joined&count=5` : null);

  return { users };
}
