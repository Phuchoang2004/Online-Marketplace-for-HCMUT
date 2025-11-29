import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Package,
    Calendar,
    MapPin,
    Phone,
    User,
    PackageCheck,
    Search,
    Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

// --- Types ---
interface Product {
    _id: string;
    name: string;
    price: number;
    images?: string[] | { url: string }[];
}

interface OrderItem {
    product: Product;
    vendor: string | { _id: string };
    quantity: number;
    price: number;
    subtotal: number;
    status: 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
}

interface Order {
    _id: string;
    user: {
        _id: string;
        fullName: string;
        email: string;
        address?: string;
        phoneNumber?: string;
    };
    items: OrderItem[];
    totalAmount: number; // Global total
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

const VendorOrders = () => {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const filters = ["ALL", "PENDING", "SHIPPED", "COMPLETED", "CANCELLED"];

    // Fetch Orders
    const fetchOrders = useCallback(async () => {
        if (!user || user.role !== "VENDOR") return;

        try {
            setLoadingData(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                // Sort by newest first
                const sortedOrders = data.orders.sort((a: Order, b: Order) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setOrders(sortedOrders);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchOrders();
        }
    }, [user, authLoading, fetchOrders]);

    // Handle Process Order (PENDING -> SHIPPED)
    const handleProcessOrder = async (orderId: string) => {
        setProcessingId(orderId);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/process`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Order processed successfully!");
                fetchOrders();
            } else {
                toast.error(data.message || "Failed to process order");
            }
        } catch (error) {
            console.error("Error processing order:", error);
            toast.error("Network error while processing order");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter Logic
    const getFilteredOrders = () => {
        if (!user?.vendorProfile) return [];

        return orders.filter(order => {
            // 1. Must contain items for this vendor
            const vendorItems = order.items.filter(item => {
                const itemVendorId = typeof item.vendor === 'object' ? item.vendor._id : item.vendor;
                return itemVendorId === user.vendorProfile;
            });
            if (vendorItems.length === 0) return false;

            // 2. Search Filter (Order ID or Customer Name)
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesId = order._id.toLowerCase().includes(searchLower);
                const matchesName = order.user?.fullName?.toLowerCase().includes(searchLower);
                if (!matchesId && !matchesName) return false;
            }

            // 3. Status Filter
            if (activeFilter !== "ALL") {
                // Determine the "Vendor Status" for this order
                // Logic: If any item is Pending -> Order is Pending for this vendor
                let vendorStatus = 'COMPLETED';
                if (vendorItems.some(i => i.status === 'PENDING')) vendorStatus = 'PENDING';
                else if (vendorItems.some(i => i.status === 'SHIPPED')) vendorStatus = 'SHIPPED';
                else if (vendorItems.every(i => i.status === 'CANCELLED')) vendorStatus = 'CANCELLED';

                if (vendorStatus !== activeFilter) return false;
            }

            return true;
        });
    };

    // Helper to extract data specific to the logged-in vendor
    const getVendorSpecificData = (order: Order) => {
        const vendorId = user?.vendorProfile;
        const myItems = order.items.filter(item => {
            const itemVendorId = typeof item.vendor === 'object' ? item.vendor._id : item.vendor;
            return itemVendorId === vendorId;
        });

        const totalAmount = myItems.reduce((acc, item) => acc + item.subtotal, 0);

        let status = 'COMPLETED';
        if (myItems.some(i => i.status === 'PENDING')) status = 'PENDING';
        else if (myItems.some(i => i.status === 'SHIPPED')) status = 'SHIPPED';
        else if (myItems.every(i => i.status === 'CANCELLED')) status = 'CANCELLED';

        return { myItems, totalAmount, status };
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#870000]" />
            </div>
        );
    }

    if (!user || user.role !== "VENDOR") return <Navigate to="/unauthorized" replace />;

    const filteredOrders = getFilteredOrders();

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Package className="h-8 w-8 text-[#870000]" />
                            Order Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage your incoming orders
                        </p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeFilter === filter
                                        ? "bg-[#870000] text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {filter.charAt(0) + filter.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search Order ID or Customer..."
                            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="bg-gray-50 p-4 rounded-full inline-block mb-3">
                                <Package className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const { myItems, totalAmount, status } = getVendorSpecificData(order);

                            return (
                                <Card key={order._id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
                                    {/* Card Header: Meta Info */}
                                    <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-gray-700">#{order._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute:'2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                className={`px-3 py-1 text-xs font-semibold ${
                                                    status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200' :
                                                        status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200' :
                                                            status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' :
                                                                'bg-red-100 text-red-800 hover:bg-red-100 border-red-200'
                                                }`}
                                                variant="outline"
                                            >
                                                {status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-6">
                                        <div className="grid md:grid-cols-3 gap-8">
                                            {/* Left: Customer Info */}
                                            <div className="md:col-span-1 space-y-4 border-r border-gray-100 pr-4">
                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <User className="h-4 w-4" /> Customer Details
                                                </h4>
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Name</p>
                                                        <p className="font-medium text-gray-800">{order.user?.fullName || "Guest User"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Contact</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                            <p className="text-gray-800 font-mono">{order.user?.phoneNumber || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Shipping Address</p>
                                                        <div className="flex items-start gap-2 mt-0.5">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                                                            <p className="text-gray-800 leading-snug">{order.user?.address || "No address provided"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Items & Actions */}
                                            <div className="md:col-span-2 flex flex-col justify-between">
                                                {/* Items List */}
                                                <div className="space-y-4 mb-6">
                                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                        <Package className="h-4 w-4" /> Items ({myItems.length})
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {myItems.map((item, idx) => (
                                                                <div key={idx}
                                                                     className="flex gap-4 items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                                                    <div
                                                                        className="h-12 w-12 bg-white rounded border border-gray-200 overflow-hidden shrink-0">
                                                                        {item.product?.images ? (
                                                                            <img
                                                                                src={getImageUrl(item.product.images[0])}
                                                                                alt={item.product.name}
                                                                                className="h-full w-full object-cover"
                                                                                onError={(e) => {
                                                                                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                className="h-full w-full flex items-center justify-center bg-gray-100">
                                                                                <Package
                                                                                    className="h-4 w-4 text-gray-400"/>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || "Unknown Product"}</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span
                                                                            className="font-medium text-gray-900">{item.subtotal.toLocaleString('vi-VN')}đ</span>
                                                                    </div>
                                                                </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Footer Actions */}
                                                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-4 mt-auto gap-4">
                                                    <div className="text-center sm:text-left">
                                                        <span className="text-sm text-gray-500">Total Earnings</span>
                                                        <p className="text-xl font-bold text-[#870000]">{totalAmount.toLocaleString('vi-VN')}đ</p>
                                                    </div>

                                                    {status === 'PENDING' && (
                                                        <Button
                                                            onClick={() => handleProcessOrder(order._id)}
                                                            disabled={processingId === order._id}
                                                            className="w-full sm:w-auto bg-[#870000] hover:bg-[#6e0000] text-white"
                                                        >
                                                            {processingId === order._id ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PackageCheck className="mr-2 h-4 w-4" />
                                                                    Process Order
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorOrders;