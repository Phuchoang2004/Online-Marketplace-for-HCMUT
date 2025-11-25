import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart,
    Search,
    Shield,
    ChartColumnBig,
    LogOut,
    AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
    const { user, logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleConfirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-[#870000] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">H</span>
                            </div>
                            <span className="font-bold text-lg hidden sm:inline-block">HCMUT Marketplace</span>
                            <span className="font-bold text-lg sm:hidden">HCMUT</span>
                        </Link>



                        {/* Right side */}
                        <nav className="flex items-center space-x-2">
                            {user?.role === "ADMIN" && (
                                <Button variant="ghost" size="sm" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                    <Link to="/admin" className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <span className="hidden lg:inline">Admin</span>
                                    </Link>
                                </Button>
                            )}
                            {user?.role === "VENDOR" && (
                                <Button variant="outline" size="sm" asChild className="text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200">
                                    <Link to="/seller/dashboard" className="flex items-center gap-2">
                                        <ChartColumnBig className="h-4 w-4" />
                                        <span className="hidden lg:inline">Seller Dashboard</span>
                                    </Link>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/marketplace">Browse</Link>
                            </Button>

                            <Button variant="ghost" size="icon" className={"hover:text-blue-200 hover:bg-blue-500"}>
                                <Link to="/mycart">
                                    <ShoppingCart className="h-5 w-5" />
                                </Link>
                            </Button>

                            {user ? (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to="/profile" className="font-medium">{user.fullName}</Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowLogoutConfirm(true)}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <Button className="bg-[#870000] hover:bg-[#6b0000] text-white" size="sm" asChild>
                                    <Link to="/login">Login</Link>
                                </Button>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <LogOut className="h-6 w-6 text-red-600 ml-1" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Sign out?
                            </h3>

                            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                                Are you sure you want to log out of your account? You will need to log in again to access your profile.
                            </p>

                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowLogoutConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleConfirmLogout}
                                >
                                    Yes, Log out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};