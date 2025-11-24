import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useToast } from "../components/ui/use-toast";
import {
    Loader2,
    ShoppingCart,
    Trash2,
    ArrowRight,
    Minus,
    Plus,
    ShoppingBag,
    Store
} from "lucide-react";

// Define interface based on typical populated cart structure
// You may need to adjust based on your exact API response
interface Product {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    description?: string;
}

interface CartItem {
    _id: string; // The cart item ID
    product: Product; // Populated product details
    quantity: number;
    price: number; // Snapshot price
}

const Cart = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        // Fetch cart data
        const fetchCart = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch("http://localhost:5000/api/cart", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.status === 401) {
                    // Token expired or invalid
                    return;
                }

                if (!res.ok) {
                    throw new Error("Failed to fetch cart");
                }

                const data = await res.json();
                const items = Array.isArray(data) ? data : (data.items || []);
                setCartItems(items);
            } catch (err) {
                console.error(err);
                setError("Could not load your cart. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchCart();
        } else if (!authLoading && !user) {
            // Redirect if not logged in
            navigate("/login");
        }
    }, [user, authLoading, navigate]);

    // Calculate totals
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 30000 : 0; // Flat rate example, 0 if empty
    const total = subtotal + shipping;

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (authLoading || (loading && !error)) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-[#870000]" />
                        <p className="text-muted-foreground animate-pulse">Loading your cart...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-[#333333]">
                    <ShoppingBag className="h-8 w-8 text-[#870000]" />
                    Your Shopping Cart
                    <span className="text-lg font-normal text-muted-foreground ml-2">
                        ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </span>
                </h1>

                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                        <Button variant="link" onClick={() => window.location.reload()} className="text-red-800 underline">
                            Retry
                        </Button>
                    </div>
                ) : cartItems.length === 0 ? (
                    // EMPTY STATE
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-gray-50 p-6 rounded-full mb-6">
                            <ShoppingCart className="h-16 w-16 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 max-w-md mb-8">
                            Looks like you haven't added anything to your cart yet.
                            Explore our marketplace to find great deals on student essentials.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-[#870000] hover:bg-[#6b0000] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            <Link to="/marketplace">
                                <Store className="mr-2 h-5 w-5" />
                                Browse Marketplace
                            </Link>
                        </Button>
                    </div>
                ) : (
                    // CART CONTENT
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 transition-all hover:shadow-md"
                                >
                                    {/* Product Image Placeholder */}
                                    <div className="h-24 w-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                                        {item.product.images && item.product.images.length > 0 ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                <Store className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                                                    {item.product.name}
                                                </h3>
                                                <button
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className="text-[#870000] font-bold mt-1">
                                                {formatPrice(item.product.price)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            {/* Quantity Control */}
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                                <button
                                                    className="p-1 px-2 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    className="p-1 px-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Item Total */}
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">Total</span>
                                                <span className="font-semibold text-sm">
                                                    {formatPrice(item.product.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 border-gray-200 shadow-md">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium">
                                            {shipping === 0 ? "Free" : formatPrice(shipping)}
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-2xl text-[#870000]">{formatPrice(total)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 pt-2">
                                    <Button className="w-full bg-[#870000] hover:bg-[#6b0000] text-white py-6 text-lg shadow-md hover:shadow-lg transition-all">
                                        Proceed to Checkout
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link to="/marketplace">Continue Shopping</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;