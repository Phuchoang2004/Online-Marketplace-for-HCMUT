import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Plus, Clock, CheckCircle, Loader2, MapPin, Phone, User, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// --- Types based on your Mongoose Schema ---
interface Product {
    _id: string;
    name: string;
    price: number;
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
    totalAmount: number;
    createdAt: string;
}

interface DashboardMetrics {
    totalSales: number;
    pendingCount: number;
    completedCount: number;
}

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    // Track which order is currently being processed to show specific loading state
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Dashboard Metrics State
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalSales: 0,
        pendingCount: 0,
        completedCount: 0
    });

    // Calculate Dashboard Metrics based on fetched data
    const calculateMetrics = (orderList: Order[], vendorId: string) => {
        let total = 0;
        let pending = 0;
        let completed = 0;

        orderList.forEach(order => {
            // Filter items belonging to THIS vendor
            const vendorItems = order.items.filter(item => {
                const itemVendorId = typeof item.vendor === 'object' ? item.vendor._id : item.vendor;
                return itemVendorId === vendorId;
            });

            if (vendorItems.length === 0) return;

            const orderTotalForVendor = vendorItems.reduce((sum, item) => sum + item.subtotal, 0);

            // Check status of the items specific to this vendor
            const hasPending = vendorItems.some(i => i.status === 'PENDING');
            const isCompleted = vendorItems.every(i => ['COMPLETED', 'SHIPPED'].includes(i.status));

            if (hasPending) pending++;
            if (isCompleted) {
                completed++;
                total += orderTotalForVendor;
            }
        });

        setMetrics({
            totalSales: total,
            pendingCount: pending,
            completedCount: completed
        });
    };

    // Fetch Orders Function (Memoized to be called from Effect and Event Handlers)
    const fetchOrders = useCallback(async () => {
        if (!user || user.role !== "VENDOR") return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log("Fetched Orders:", data);

            if (data.success) {
                setOrders(data.orders);
                const vendorId = user.vendorProfile;
                calculateMetrics(data.orders, vendorId);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    // Initial Fetch
    useEffect(() => {
        if (!authLoading) {
            fetchOrders();
        }
    }, [user, authLoading, fetchOrders]);

    // --- New Function: Handle Process Order ---
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
                // Re-fetch data to update UI and Metrics accurately
                await fetchOrders();
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

    // Helper to get display data for a row
    const getOrderDisplayData = (order: Order) => {
        const vendorId = user?.vendorProfile;

        // Filter items for this vendor
        const myItems = order.items.filter(item => {
            const itemVendorId = typeof item.vendor === 'object' ? item.vendor._id : item.vendor;
            return itemVendorId === vendorId;
        });

        if (myItems.length === 0) return null;

        const firstProduct = myItems[0]?.product?.name || "Unknown Product";
        const otherCount = myItems.length - 1;
        const displayProduct = otherCount > 0 ? `${firstProduct} (+${otherCount} others)` : firstProduct;

        const totalAmount = myItems.reduce((acc, item) => acc + item.subtotal, 0);

        let status = 'COMPLETED';
        if (myItems.some(i => i.status === 'PENDING')) {
            status = 'PENDING';
        } else if (myItems.some(i => i.status === 'SHIPPED')) {
            status = 'SHIPPED';
        } else if (myItems.every(i => i.status === 'CANCELLED')) {
            status = 'CANCELLED';
        }

        return {
            productName: displayProduct,
            amount: totalAmount,
            status: status
        };
    };

    const stats = [
        {
            title: "Total Sales",
            value: metrics.totalSales.toLocaleString('vi-VN') + "đ",
            change: "All time",
            icon: DollarSign,
            color: "text-accent"
        },
        {
            title: "Active Listings",
            value: "12",
            change: "--",
            icon: Package,
            color: "text-primary"
        },
        {
            title: "Pending Orders",
            value: metrics.pendingCount.toString(),
            change: "Needs Action",
            icon: Clock,
            color: "text-muted-foreground"
        },
        {
            title: "Completed",
            value: metrics.completedCount.toString(),
            change: "Fulfilled",
            icon: CheckCircle,
            color: "text-accent"
        },
    ];

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#870000]" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "VENDOR") return <Navigate to="/unauthorized" replace />;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Seller Dashboard</h1>
                        <p className="text-muted-foreground">Manage your listings and track your sales</p>
                    </div>
                    <Button size="lg" variant="gold" onClick={() => navigate('/vendor/products/add')}>
                        <Plus className="mr-2 h-5 w-5" />
                        Add New Listing
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">
                                    <span className="text-accent font-medium">{stat.change}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage your seller account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* CHANGED: grid-cols-4 to grid-cols-3 and removed Analytics button */}
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col gap-2"
                                onClick={() => navigate('/vendor/products')}
                            >
                                <Package className="h-6 w-6" />
                                <span>My Listings</span>
                            </Button>
                            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/vendor/products/add')}>
                                <Plus className="h-6 w-6" />
                                <span>Add Product</span>
                            </Button>
                            {/* CHANGED: Added navigation to /vendor/orders */}
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col gap-2"
                                onClick={() => navigate('/vendor/orders')}
                            >
                                <Clock className="h-6 w-6" />
                                <span>Orders</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Your latest sales and order status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No orders found.
                                </div>
                            ) : (
                                orders.slice(0, 5).map((order) => { // Optional: slice to show only top 5 recent
                                    const displayData = getOrderDisplayData(order);
                                    if (!displayData) return null;

                                    const { productName, amount, status } = displayData;

                                    return (
                                        <div
                                            key={order._id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                                        >
                                            <div className="flex-1 space-y-3">
                                                {/* Product Name & Date */}
                                                <div>
                                                    <div className="font-semibold text-lg">{productName}</div>
                                                    <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">
                                                            #{order._id.slice(-6).toUpperCase()}
                                                        </span>
                                                        <span>• {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-gray-800 max-w-xl">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-amber-600 shrink-0" />
                                                            <span className="font-medium">{order.user?.fullName || "Guest"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-amber-600 shrink-0" />
                                                            <span className="font-mono">{order.user?.phoneNumber || "No Phone"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:col-span-2">
                                                            <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                                                            <span className="truncate" title={order.user?.address}>
                                                                {order.user?.address || "No Address Provided"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price, Status & Actions */}
                                            <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 justify-between border-t sm:border-t-0 pt-4 sm:pt-0">
                                                <div className="text-right">
                                                    <div className="font-bold text-lg text-[#870000]">
                                                        {amount.toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className="px-3 py-1"
                                                        variant={
                                                            status === "COMPLETED" ? "default" :
                                                                status === "PENDING" ? "secondary" : "outline"
                                                        }
                                                    >
                                                        {status}
                                                    </Badge>

                                                    {/* Process Button - Only visible if PENDING */}
                                                    {status === 'PENDING' && (
                                                        <Button
                                                            size="sm"
                                                            variant="gold"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleProcessOrder(order._id)}
                                                            disabled={processingId === order._id}
                                                        >
                                                            {processingId === order._id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <PackageCheck className="h-3 w-3 mr-1" />
                                                                    Process
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="mt-6 text-center">
                            <Button variant="outline" onClick={() => navigate('/vendor/orders')}>View All Orders</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SellerDashboard;