import useSWR from "swr";

export default function useAdminReports(user) {
  const { data: reports, error } = useSWR(user?.isLoggedIn && user?.permissions.admin ? "/api/reports" : null);

  return { reports, error };
}
