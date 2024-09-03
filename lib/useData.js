import useSWR from "swr";

export default function useData(user, dataType, id, filter) {
  var params = "";
  if (id) {
    params += "/" + id;
  }
  if (dataType === "tasks" && filter) {
    params += "?filter=" + filter;
  }
  const { data, error, mutate } = useSWR(user?.isLoggedIn && !user?.permissions.banned ? `/api/${dataType + params}` : null);

  return { data, error, mutate };
}
