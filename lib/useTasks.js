import useSWR from "swr";

export default function useTasks(user, collections, filter) {
  var params;
  if (collections === true) {
    params = "?collections=true";
  } else if (filter) {
    params = "?filter=" + filter;
  }
  const { data: tasks } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/tasks${params}` : null);

  return { tasks };
}
