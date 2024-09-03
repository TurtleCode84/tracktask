import useSWR from "swr";

export default function useAdminUser(user, id) {
  const { data: lookup, error, mutate } = useSWR(user?.isLoggedIn && user?.permissions.admin ? `/api/admin/users/${id}` : null);

  return { lookup, error, mutate };
}
