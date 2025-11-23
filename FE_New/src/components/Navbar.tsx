import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {ShoppingCart, User, Search, Shield} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";


export const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">H</span>
                        </div>
                        <span className="font-bold text-lg">HCMUT Marketplace</span>
                    </Link>

                    {/* Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 bg-background"
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <nav className="flex items-center space-x-2">
                        {user?.role === "ADMIN" && (
                            <Button variant="ghost" size="sm" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                <Link to="/admin/dashboard" className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    <span className="hidden lg:inline">Admin</span>
                                </Link>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/marketplace">Browse</Link>
                        </Button>

                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="h-5 w-5" />
                        </Button>

                        {user ? (
                            <><Button variant="ghost" size="sm" asChild>
                                <Link to="/profile">{user.fullName}</Link>
                            </Button><Button variant="destructive" size="sm" onClick={logout}>Logout</Button></>
                        ) : (
                            <Button variant="gold" size="sm" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
