import useSWR from "swr";

export default function useTasks(user, id, collection) {
  // We do a request to /api/events only if the user is logged in
  const { data: tasks } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/tasks/${id}?collection=${collection}` : null);

  return { tasks };
}
