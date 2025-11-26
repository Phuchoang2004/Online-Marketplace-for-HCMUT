import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, TrendingUp, Plus, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {Navigate, useNavigate} from "react-router-dom";

// --- Types based on your Mongoose Schema ---
interface Product {
    _id: string;
    name: string;
    price: number;
}

interface OrderItem {
    product: Product;
    vendor: string | { _id: string }; // Can be an ID string or a populated object
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
    };
    items: OrderItem[];
    totalAmount: number; // This is the total for the whole order (all vendors)
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

    // Dashboard Metrics State
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalSales: 0,
        pendingCount: 0,
        completedCount: 0
    });

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || user.role !== "VENDOR") return;

            try {
                const token = localStorage.getItem('accessToken');
                // Fetching all orders to calculate stats correctly.
                // If you only want pending, append ?status=PENDING, but that breaks "Total Sales" stats.
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
                    // We use user.vendorProfile because the OrderItem schema references 'Vendor'
                    // and usually the User model links to Vendor via vendorProfile field.
                    const vendorId = user.vendorProfile;
                    calculateMetrics(data.orders, vendorId);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoadingData(false);
            }
        };

        if (!authLoading) {
            fetchOrders();
        }
    }, [user, authLoading]);

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
            // Completed if all items are either shipped or completed (and not cancelled)
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

    // Helper to get display data for a row
    const getOrderDisplayData = (order: Order) => {
        const vendorId = user?.vendorProfile;

        // Filter items for this vendor
        const myItems = order.items.filter(item => {
            const itemVendorId = typeof item.vendor === 'object' ? item.vendor._id : item.vendor;
            return itemVendorId === vendorId;
        });

        if (myItems.length === 0) return null; // Should not happen given the API filter

        const firstProduct = myItems[0]?.product?.name || "Unknown Product";
        const otherCount = myItems.length - 1;
        const displayProduct = otherCount > 0 ? `${firstProduct} (+${otherCount} others)` : firstProduct;

        // Sum subtotal for this vendor only
        const totalAmount = myItems.reduce((acc, item) => acc + item.subtotal, 0);

        // Determine aggregate status for this vendor's items in this order
        // Priority: PENDING -> SHIPPED -> COMPLETED
        let status = 'COMPLETED';
        if (myItems.some(i => i.status === 'PENDING')) {
            status = 'PENDING';
        } else if (myItems.some(i => i.status === 'SHIPPED')) {
            status = 'SHIPPED'; // If some are shipped and others completed/shipped, overall is shipped
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
            value: "12", // Ideally fetch this from a /products/count endpoint
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
    // Assuming 'VENDOR' is the role string
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
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                            <Button variant="outline" className="h-24 flex flex-col gap-2">
                                <Clock className="h-6 w-6" />
                                <span>Orders</span>
                            </Button>
                            <Button variant="outline" className="h-24 flex flex-col gap-2">
                                <TrendingUp className="h-6 w-6" />
                                <span>Analytics</span>
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
                                orders.map((order) => {
                                    const displayData = getOrderDisplayData(order);
                                    if (!displayData) return null; // Skip if no items for this vendor in this order

                                    const { productName, amount, status } = displayData;

                                    return (
                                        <div
                                            key={order._id}
                                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="font-semibold mb-1">{productName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order._id.slice(-6).toUpperCase()} • {order.user?.fullName || "Guest"} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-bold">{amount.toLocaleString('vi-VN')}đ</div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        status === "COMPLETED"
                                                            ? "default"
                                                            : status === "PENDING"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                >
                                                    {status}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="mt-6 text-center">
                            <Button variant="outline">View All Orders</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SellerDashboard;