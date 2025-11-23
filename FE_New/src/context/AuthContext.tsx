import { createContext, useContext, useEffect, useState } from "react";

type User = {
    fullName: string;
    email: string;
    role: string;
    permission: string[];
    id: string;
    iat: number;
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (token: string) => {
        localStorage.setItem("accessToken", token);
        const decoded = decodeJWT(token);
        setUser(decoded);
    };
    const logout = () => {
        localStorage.removeItem("accessToken");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
