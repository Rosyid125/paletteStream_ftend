import { createContext, useContext, useEffect, useState } from "react";
import { fetchMe } from "@/services/authService";

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetchMe();
        setUser(res.data); // res.data sesuai dengan return fetchMe
        console.log("User data fetched:", res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);

  return <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
