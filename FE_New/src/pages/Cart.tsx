import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useToast } from "../components/ui/use-toast";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Loader2,
    ShoppingCart,
    Trash2,
    ArrowRight,
    Minus,
    Plus,
    ShoppingBag,
    Store,
    MapPin,
    Phone,
    User,
    CheckCircle2,
    X
} from "lucide-react";

interface Product {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    description?: string;
}

interface CartItem {
    _id: string;
    product: Product;
    quantity: number;
    price: number;
}

const Cart = () => {
    // Added setUser to update local state after API call
    const { user, loading: authLoading, setUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Data States
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Action States
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);

    // Modal State
    const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        address: "",
        phoneNumber: ""
    });

    // --- 1. Fetch Cart Logic ---
    useEffect(() => {
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

                if (res.status === 401) return; // AuthContext handles redirect usually
                if (!res.ok) throw new Error("Failed to fetch cart");

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
            navigate("/login");
        }
    }, [user, authLoading, navigate]);

    // --- 2. Cart Item Actions ---
    const handleRemoveItem = async (itemId: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to remove item");
            setCartItems((prev) => prev.filter((item) => item.product._id !== itemId));
            toast({ title: "Item removed", description: "Item removed from cart." });
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1 || updatingItems.has(cartItemId)) return;
        const originalItems = [...cartItems];

        // Optimistic update
        setCartItems(prev => prev.map(item =>
            item.product._id === cartItemId ? { ...item, quantity: newQuantity } : item
        ));
        setUpdatingItems(prev => new Set(prev).add(cartItemId));

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });
            if (!res.ok){
                setCartItems(originalItems)
                toast({ title: "Update failed", description: "No stock left to add.", variant: "destructive" });
            }; // Revert on error
        } catch (err) {
            setCartItems(originalItems);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(cartItemId);
                return next;
            });
        }
    };

    const handleClearCart = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            await fetch("http://localhost:5000/api/cart-clear", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            setCartItems([]);
            toast({ title: "Cart cleared", description: "Your cart is now empty." });
        } catch (err) {
            console.error(err);
        }
    };

    // --- 3. Checkout Logic ---

    // Step A: The Entry Point
    const handleCheckoutClick = () => {
        if (!user) return;

        // Check if phone or address is missing or empty
        // Note: AuthContext has 'phone', prompt requested 'phoneNumber'. We check 'phone' from context.
        const isInfoMissing = !user.address || !user.phone || user.address.trim() === "" || user.phone.trim() === "";

        if (isInfoMissing) {
            // Pre-fill what we have
            setFormData({
                fullName: user.fullName || "",
                address: user.address || "",
                phoneNumber: user.phone || ""
            });
            setShowMissingInfoModal(true);
        } else {
            // User has all info, proceed to place order
            placeOrder();
        }
    };

    // Step B: Update User Info (if missing)
    const handleUpdateUserInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        const vietnamPhoneRegex = /^(03|05|07|08|09)\d{8}$/;

        if (!vietnamPhoneRegex.test(formData.phoneNumber)) {
            toast({
                variant: "destructive",
                title: "Invalid Phone Number",
                description: "Please enter a valid phone number (e.g., 0901234567).",
            });
            return;
        }

        setIsProcessingCheckout(true);

        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch("http://localhost:5000/api/user", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    address: formData.address,
                    phoneNumber: formData.phoneNumber
                })
            });

            if (!res.ok) throw new Error("Failed to update user info");

            if (user) {
                const updatedUser = {
                    ...user,
                    fullName: formData.fullName,
                    address: formData.address,
                    phone: formData.phoneNumber
                };
                setUser(updatedUser);
            }

            setShowMissingInfoModal(false);
            await placeOrder();

        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update your shipping information.",
            });
            setIsProcessingCheckout(false);
        }
    };
    // Step C: Finalize Order
    const placeOrder = async () => {
        setIsProcessingCheckout(true);
        try {
            const token = localStorage.getItem("accessToken");
            await fetch("http://localhost:5000/api/cart/checkout", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
            });

            setCartItems([]);
            setIsOrderSuccess(true);
            window.scrollTo(0, 0);

        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Checkout Error",
                description: "Something went wrong processing your order.",
            });
        } finally {
            setIsProcessingCheckout(false);
        }
    };


    // Calculations
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 30000 : 0;
    const total = subtotal + shipping;
    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // --- RENDER: SUCCESS VIEW ---
    if (isOrderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <Navbar />
                <div className="container mx-auto px-4 pt-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-green-100 p-6 rounded-full mb-6">
                        <CheckCircle2 className="h-24 w-24 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#333333] mb-4">Order Placed Successfully!</h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Thank you, <span className="font-bold">{user?.fullName}</span>!
                    </p>
                    <p className="text-gray-500 max-w-lg mb-8">
                        We have sent a notification to the vendor. Your items will be shipped to:
                        <br />
                        <span className="font-medium text-gray-800 block mt-2 p-2 bg-gray-100 rounded">
                            {user?.address}
                        </span>
                    </p>
                    <div className="flex gap-4">
                        <Button asChild className="bg-[#870000] hover:bg-[#6b0000] text-white px-8 py-6 text-lg">
                            <Link to="/marketplace">Continue Shopping</Link>
                        </Button>
                        <Button asChild variant="outline" className="px-8 py-6 text-lg">
                            <Link to="/">Back Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (authLoading || (loading && !error)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#870000]" />
                    <p className="text-muted-foreground">Loading cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 relative">
            <Navbar />

            {/* --- MISSING INFO MODAL --- */}
            {showMissingInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-[#870000] px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MapPin className="h-5 w-5" /> Shipping Details
                            </h2>
                            <button
                                onClick={() => setShowMissingInfoModal(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-6 text-sm">
                                To complete your order, we need your shipping address and phone number.
                            </p>

                            <form onSubmit={handleUpdateUserInfo} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                            className="pl-9"
                                            placeholder="090..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Delivery Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="pl-9"
                                            placeholder="House number, Street, Ward..."
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#870000] hover:bg-[#6b0000] mt-4 py-6 text-lg"
                                    disabled={isProcessingCheckout}
                                >
                                    {isProcessingCheckout ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        "Save & Place Order"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-[#333333]">
                    <ShoppingBag className="h-8 w-8 text-[#870000]" />
                    Your Shopping Cart
                    <span className="text-lg font-normal text-muted-foreground ml-2">
                        ({cartItems.length} items)
                    </span>
                </h1>

                <div className="mb-6 flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={handleClearCart}
                        disabled={cartItems.length === 0}
                        className="text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border-red-200"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                    </Button>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                        <span>{error}</span>
                        <Button variant="link" onClick={() => window.location.reload()} className="text-red-800">Retry</Button>
                    </div>
                ) : cartItems.length === 0 ? (
                    // EMPTY STATE
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-6">
                            <ShoppingCart className="h-16 w-16 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 max-w-md mb-8">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <Button asChild size="lg" className="bg-[#870000] hover:bg-[#6b0000] text-white px-8">
                            <Link to="/marketplace">
                                <Store className="mr-2 h-5 w-5" /> Browse Marketplace
                            </Link>
                        </Button>
                    </div>
                ) : (
                    // CART CONTENT
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.product._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                                    <div className="h-24 w-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                        {item.product.images?.[0] ? (
                                            <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-300"><Store /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold text-lg line-clamp-1">{item.product.name}</h3>
                                            <button onClick={() => handleRemoveItem(item.product._id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-[#870000] font-bold">{formatPrice(item.product.price)}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center border rounded-lg bg-gray-50">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                                    className="p-1 px-2 hover:bg-gray-200 rounded-l-lg disabled:opacity-50"
                                                    disabled={item.quantity <= 1 || updatingItems.has(item.product._id)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                                    className="p-1 px-2 hover:bg-gray-200 rounded-r-lg disabled:opacity-50"
                                                    disabled={updatingItems.has(item.product._id)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <span className="font-semibold text-sm">{formatPrice(item.product.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

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
                                        <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-2xl text-[#870000]">{formatPrice(total)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 pt-2">
                                    <Button
                                        className="w-full bg-[#870000] hover:bg-[#6b0000] text-white py-6 text-lg shadow-md"
                                        onClick={handleCheckoutClick}
                                        disabled={isProcessingCheckout}
                                    >
                                        {isProcessingCheckout ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <>Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" /></>
                                        )}
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