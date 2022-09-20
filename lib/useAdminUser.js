import useSWR from "swr";

export default function useAdminUser(user, getUser) {
  // We do a request to /api/events only if the user is logged in
  const { data: getUser } = useSWR(user?.isLoggedIn && user?.permissions.admin ? `/api/admin/users/{getUser}` : null);

  return { getUser };
}
