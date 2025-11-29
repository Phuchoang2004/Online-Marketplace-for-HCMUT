import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
    Loader2,
    Package,
    Calendar,
    ShoppingBag,
    PackageCheck
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Types ---
interface Product {
    _id: string;
    name: string;
    price: number;
    images?: string[] | { url: string }[];
}

interface OrderItem {
    product: Product;
    quantity: number;
    _id: string;
}

interface Order {
    _id: string;
    user: string;
    items: OrderItem[];
    totalAmount: number;
    status: "PENDING" | "CONFIRMED" | "SHIPPING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
    address: string;
    phoneNumber: string;
    createdAt: string;
}

// --- Helper for Image URLs ---
const getImageUrl = (imageData: string | { url: string } | undefined) => {
    if (!imageData) return "https://placehold.co/100x100?text=No+Img";
    const imagePath = typeof imageData === 'string' ? imageData : imageData.url;
    if (!imagePath) return "https://placehold.co/100x100?text=No+Img";
    if (imagePath.startsWith("http")) return imagePath;
    const formattedPath = imagePath.replace('/uploads', '/static');
    return `http://localhost:5000${formattedPath}`;
};

const MyOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("ALL");

    // State for managing the confirmation dialog and processing
    const [orderToConfirm, setOrderToConfirm] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filters = ["ALL", "PENDING", "SHIPPED", "COMPLETED", "CANCELLED"];

    useEffect(() => {
        fetchOrders();
    }, [activeFilter, navigate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                navigate("/login");
                return;
            }

            let url = "http://localhost:5000/api/orders/my";
            if (activeFilter !== "ALL") {
                url += `?type=${activeFilter}`;
            }

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 401) {
                navigate("/login");
                return;
            }

            if (!res.ok) throw new Error("Failed to fetch orders");

            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error(err);
            setError("Unable to load your order history.");
        } finally {
            setLoading(false);
        }
    };

    // --- Action Handlers ---

    // 1. Opens the dialog
    const confirmReceiveOrder = (orderId: string) => {
        setOrderToConfirm(orderId);
    };

    // 2. Performs the API call
    const handleProcessOrder = async () => {
        if (!orderToConfirm) return;

        const orderId = orderToConfirm;
        setProcessingId(orderId);

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/process`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "complete" })
            });

            const data = await res.json();
            console.log(data);

            if (res.ok && data.success) {
                toast.success("Order marked as received successfully!");
                await fetchOrders(); // Refresh list
                setOrderToConfirm(null); // Close dialog
            } else {
                toast.error(data.message || "Failed to update order");
            }
        } catch (error) {
            console.error("Error processing order:", error);
            toast.error("Network error. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    // --- Helpers ---

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-200";
            case "SHIPPING":
            case "SHIPPED": return "bg-purple-100 text-purple-800 border-purple-200";
            case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
            case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#333333] flex items-center gap-3">
                        <Package className="h-8 w-8 text-[#870000]" />
                        My Orders
                    </h1>
                    <p className="text-gray-500 mt-2">Track and manage your recent purchases.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                activeFilter === filter
                                    ? "bg-[#870000] text-white shadow-md"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                        >
                            {filter.charAt(0) + filter.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[#870000] mb-4" />
                        <p className="text-gray-500">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
                        <p>{error}</p>
                        <Button
                            variant="link"
                            onClick={fetchOrders}
                            className="text-red-800 font-bold mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="bg-gray-50 p-6 rounded-full inline-block mb-4">
                            <ShoppingBag className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">
                            {activeFilter === "ALL"
                                ? "You haven't placed any orders yet."
                                : `You have no orders with status "${activeFilter.toLowerCase()}".`}
                        </p>
                        <Button asChild className="bg-[#870000] hover:bg-[#6b0000]">
                            <Link to="/marketplace">Start Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-md border border-gray-200">
                                            <Package className="h-5 w-5 text-[#870000]" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Order ID</p>
                                            <p className="font-mono font-bold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="h-16 w-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                                                    {item.product && item.product.images && item.product.images.length > 0 ? (
                                                        <img
                                                            src={getImageUrl(item.product.images[0])}
                                                            alt={item.product.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                            <ShoppingBag className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 line-clamp-1">
                                                        {item.product ? item.product.name : "Product Unavailable"}
                                                    </h4>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-sm text-gray-500">
                                                            Qty: {item.quantity} x {item.product ? formatPrice(item.product.price) : "N/A"}
                                                        </p>
                                                        <p className="font-medium text-gray-900">
                                                            {item.product ? formatPrice(item.product.price * item.quantity) : "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer (UPDATED LAYOUT) */}
                                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-end">
                                    {/* Left: Item Count */}
                                    <div className="text-sm text-gray-500 mb-2">
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </div>

                                    {/* Right: Vertical Stack (Price Top, Button Bottom) */}
                                    <div className="flex flex-col items-end gap-3">
                                        {/* Price Info */}
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500 mb-1">
                                                (Shipping: {formatPrice(30000)})
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Total:</span>
                                                <span className="text-xl font-bold text-[#870000]">
                                                    {formatPrice((order.totalAmount || 0) + 30000)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button: Open Confirmation Dialog */}
                                        {order.status === 'SHIPPED' && (
                                            <Button
                                                onClick={() => confirmReceiveOrder(order._id)}
                                                className="bg-green-600 hover:bg-green-700 text-white transition-colors w-full sm:w-auto"
                                            >
                                                <PackageCheck className="mr-2 h-4 w-4" />
                                                I have received the product
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!orderToConfirm} onOpenChange={(open) => !open && setOrderToConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Order Receipt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark this order as received?
                            <br /><br />
                            By confirming, you agree that the products have arrived in good condition. The order will be marked as <strong>COMPLETED</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!processingId}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleProcessOrder();
                            }}
                            disabled={!!processingId}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Yes, I Received It"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MyOrders;