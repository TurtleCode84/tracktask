import useSWR from "swr";

export default function useAdminCollections(user, id) {
  var uri = "";
  if (id) {
    uri = `/${id}`;
  }
  const { data: collections, error } = useSWR(user?.isLoggedIn && user?.permissions.admin ? `/api/admin/collections${uri}` : null);

  return { collections, error };
}
