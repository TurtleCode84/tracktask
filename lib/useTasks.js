import useSWR from "swr";

export default function useTasks(user) {
  // We do a request to /api/events only if the user is logged in
  const { data: tasks } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/tasks` : null);

  return { tasks };
}
