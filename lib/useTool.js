import useSWR from "swr";

export default function useTool(user, tool, param) {
  const { data: info, error } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/tools?tool=${tool}&param=${param}` : null);

  return { info, error };
}
