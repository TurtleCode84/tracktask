import useSWR from "swr";

export default function useTasks(user, collections, filter) {
  // We do a request to /api/events only if the user is logged in
  const params = if (collections === true) {return "?collections=true"} else if (filter) {return "?filter=" + filter};
  const { data: tasks } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/tasks${params}` : null);

  return { tasks };
}
