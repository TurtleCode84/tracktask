import useSWR from "swr";

export default function useAdminUsers(user, sort, count) {
  const { data: users } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/admin/users?sort=${sort}&count=${count}` : null);

  return { users };
}
