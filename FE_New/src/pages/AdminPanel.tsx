import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Package, ShieldCheck, Activity, Loader2, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext.tsx";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// --- Interfaces ---

// Interface for Vendor List (Tab 1)
interface VendorApplication {
    _id: string;
    user: {
        _id: string;
        fullName: string;
        email: string;
    };
    businessName: string;
    description: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

// Interface for Product List (Tab 2) - Matches your JSON
interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    // FIXED: Category is an object in your JSON
    category: {
        _id: string;
        name: string;
    } | null;
    // FIXED: Images is an array of objects
    images: { url: string }[];
    // FIXED: Vendor inside product usually has businessName
    vendor: {
        _id: string;
        businessName: string;
        user: string; // In your JSON, user is just an ID here
    };
    approvalStatus: string;
    createdAt: string;
}

const AdminPanel = () => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    // State
    const [pendingVendors, setPendingVendors] = useState<VendorApplication[]>([]);
    const [pendingProducts, setPendingProducts] = useState<Product[]>([]);

    // UI State
    const [rejectingVendor, setRejectingVendor] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [submittingRejection, setSubmittingRejection] = useState(false);
    const [approvingProduct, setApprovingProduct] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [stats, setStats] = useState({
        totalUsers: "0",
        pendingSellers: "0",
        activeListings: "0",
        reports: "0"
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Helper to extract image URL from the object structure
    const getImageUrl = (images: { url: string }[]) => {
        if (!images || images.length === 0) return null;

        // Access the .url property
        let url = images[0].url;

        // Fix local pathing if it starts with /uploads
        if (url && !url.startsWith('http')) {
            return `http://localhost:5000${url.replace('/uploads', '/static')}`;
        }
        return url;
    };

    // --- Fetch Data ---
    const fetchPendingVendors = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/vendors?status=PENDING", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            if (response.ok) {
                setPendingVendors(result.data);
                setStats(prev => ({ ...prev, pendingSellers: result.data.length.toString() }));
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    const fetchPendingProducts = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/products-pending", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();

            if (response.ok && result.success) {
                setPendingProducts(result.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (user && user.role === "ADMIN") {
                setLoading(true);
                await Promise.all([fetchPendingVendors(), fetchPendingProducts()]);
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    // --- Handlers ---
    const handleApproveVendor = async (vendorId: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`http://localhost:5000/api/vendor/${vendorId}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed");
            toast({ title: "Success", description: "Vendor approved" });
            fetchPendingVendors();
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
        }
    };

    const handleApproveProduct = async (productId: string) => {
        setApprovingProduct(productId);
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`http://localhost:5000/api/products/${productId}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed");
            toast({ title: "Success", description: "Product approved" });
            setPendingProducts(prev => prev.filter(p => p._id !== productId));
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
        } finally {
            setApprovingProduct(null);
        }
    };

    // Rejection handlers...
    const handleRejectClick = (id: string) => { setRejectingVendor(id); setRejectionReason(""); };
    const handleCancelReject = () => { setRejectingVendor(null); setRejectionReason(""); };
    const handleSubmitRejection = async () => {
        if (!rejectionReason.trim()) return;
        setSubmittingRejection(true);
        try {
            const token = localStorage.getItem("accessToken");
            await fetch(`http://localhost:5000/api/vendors/${rejectingVendor}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ reason: rejectionReason }),
            });
            toast({ title: "Success", description: "Vendor rejected" });
            setRejectingVendor(null);
            fetchPendingVendors();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setSubmittingRejection(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!user || user.role !== "ADMIN") return <Navigate to="/login" replace />;

    const statsData = [
        { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
        { title: "Pending Sellers", value: pendingVendors.length, icon: ShieldCheck, color: "text-accent" },
        { title: "Pending Products", value: pendingProducts.length, icon: Package, color: "text-blue-500" },
        { title: "Reports", value: stats.reports, icon: Activity, color: "text-destructive" },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                    <p className="text-muted-foreground">Manage platform activities</p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsData.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent><div className="text-3xl font-bold">{stat.value}</div></CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="vendors" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="vendors">Vendor Approvals</TabsTrigger>
                        <TabsTrigger value="products">Product Approvals</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                    </TabsList>

                    {/* VENDORS TAB */}
                    <TabsContent value="vendors">
                        <Card>
                            <CardHeader><CardTitle>Pending Vendors</CardTitle></CardHeader>
                            <CardContent>
                                {pendingVendors.length === 0 ? <p className="text-center py-8 text-muted-foreground">No pending vendors</p> : (
                                    <div className="space-y-4">
                                        {pendingVendors.map((vendor) => (
                                            <div key={vendor._id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg gap-4">
                                                <div>
                                                    <div className="font-semibold">{vendor.businessName}</div>
                                                    <div className="text-sm text-muted-foreground">{vendor.user.email}</div>
                                                    <div className="text-sm mt-1">{vendor.description}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleApproveVendor(vendor._id)}>Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleRejectClick(vendor._id)}>Reject</Button>
                                                </div>
                                                {/* Rejection Modal Logic would go here (simplified for brevity) */}
                                            </div>
                                        ))}
                                        {rejectingVendor && (
                                            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                                                <Label>Reason for rejection:</Label>
                                                <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="bg-white mb-2" />
                                                <div className="flex gap-2">
                                                    <Button variant="destructive" onClick={handleSubmitRejection} disabled={submittingRejection}>Confirm Reject</Button>
                                                    <Button variant="outline" onClick={handleCancelReject}>Cancel</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PRODUCTS TAB */}
                    <TabsContent value="products">
                        <Card>
                            <CardHeader><CardTitle>Product Approval Queue</CardTitle></CardHeader>
                            <CardContent>
                                {pendingProducts.length === 0 ? <p className="text-center py-8 text-muted-foreground">No pending products</p> : (
                                    <div className="grid gap-6">
                                        {pendingProducts.map((product) => (
                                            <div key={product._id} className="flex flex-col md:flex-row border rounded-lg overflow-hidden bg-white shadow-sm">
                                                {/* Image */}
                                                <div className="w-full md:w-48 h-48 bg-gray-100 flex-shrink-0">
                                                    {getImageUrl(product.images) ? (
                                                        <img src={getImageUrl(product.images)!} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 p-6 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="font-bold text-lg">{product.name}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    Sold by: <span className="font-medium text-blue-600">{product.vendor?.businessName}</span>
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                {product.approvalStatus}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-500 block">Price</span>
                                                                <span className="font-semibold text-lg">{formatPrice(product.price)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Stock</span>
                                                                <span>{product.stock} units</span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="text-gray-500 block">Category</span>
                                                                {/* FIXED: Render product.category.name safely */}
                                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                                    {product.category?.name || 'Uncategorized'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                                                        <Button
                                                            onClick={() => handleApproveProduct(product._id)}
                                                            disabled={approvingProduct === product._id}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            {approvingProduct === product._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                                            Approve Product
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card><CardContent className="py-8 text-center text-muted-foreground">User Management Coming Soon</CardContent></Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminPanel;