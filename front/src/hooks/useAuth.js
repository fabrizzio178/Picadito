import { useSessionStore } from "../stores/useSessionStore";

export default function useAuth() {
  return useSessionStore((state) => state.user);
}

