import useSWR from "swr";

export default function useEvents(user) {
  const { data: events } = useSWR(user?.isLoggedIn ? `/api/events` : null);

  return { events };
}
