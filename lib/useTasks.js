import useSWR from "swr";

export default function useTasks(user, collections, filter) {
  var params;
  if (collections === true) {
    params = "?collections=true";
  } else if (filter) {
    params = "?filter=" + filter;
  }
  const { data: tasks, error } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/tasks${params}` : null);

  return { tasks, error };
}
