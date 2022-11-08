import useSWR from "swr";

export default function useAdminReports(user, reviewed) {
  var uri = "";
  if (reviewed === "true") {
    uri = "?reviewed=true";
  }
  const { data: reports, error } = useSWR(user?.isLoggedIn && user?.permissions.admin ? `/api/reports${uri}` : null);

  return { reports, error };
}
