import { createContext, useContext, useEffect, useState } from "react";

type User = {
    fullName: string;
    email: string;
    role: string;
    address: string;
    phone: string;
    permission: string[];
    id: string;
    iat: number;
    vendorProfile: string;
    exp: number;
};

// Custom JWT decoder
const decodeJWT = (token: string): User | null => {
    try {
        const base64 = token.split(".")[1];
        const json = atob(base64);
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
};

type AuthContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = decodeJWT(token);
            if (decoded) {
                // Optional: Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp > currentTime) {
                    setUser(decoded);
                } else {
                    // Token expired, remove it
                    localStorage.removeItem("accessToken");
                }
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem("accessToken", token);
        const decoded = decodeJWT(token);
        setUser(decoded);
        console.log("Decoded user:", decoded);
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};