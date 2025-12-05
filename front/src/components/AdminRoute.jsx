import { Navigate } from "react-router-dom";
import { useSessionStore } from "../stores/useSessionStore";

export default function AdminRoute({ children }) {
    const user = useSessionStore((state) => state.user);
    const allowDevPreview = import.meta.env.DEV;

    if (!allowDevPreview && (!user || user.rol !== "admin")) {
        return <Navigate to="/" replace />;
    }

    return children;
}
