import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Package, ShieldCheck, Activity, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext.tsx";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Vendor {
    _id: string;
    user: {
        _id: string;
        fullName: string;
        email: string;
    };
    businessName: string;
    description: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    suspended: boolean;
    createdAt: string;
    updatedAt: string;
}

const AdminPanel = () => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [rejectingVendor, setRejectingVendor] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [submittingRejection, setSubmittingRejection] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: "0",
        pendingSellers: "0",
        activeListings: "0",
        reports: "0"
    });

    // Fetch pending vendors
    const fetchPendingVendors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/vendors?status=PENDING", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                toast({
                    title: "Session Expired",
                    description: "Please log in again.",
                    variant: "destructive",
                });
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch vendors");
            }

            const result = await response.json();
            setPendingVendors(result.data);
            setStats(prev => ({
                ...prev,
                pendingSellers: result.data.length.toString()
            }));
        } catch (error) {
            console.error("Error fetching vendors:", error);
            toast({
                title: "Error",
                description: "Failed to load pending vendors",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === "ADMIN") {
            fetchPendingVendors();
        }
    }, [user]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Redirect to login if not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to unauthorized if not admin
    if (user.role !== "ADMIN") {
        return <Navigate to="/unauthorized" replace />;
    }

    const statsData = [
        { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
        { title: "Pending Sellers", value: stats.pendingSellers, icon: ShieldCheck, color: "text-accent" },
        { title: "Active Listings", value: stats.activeListings, icon: Package, color: "text-primary" },
        { title: "Reports", value: stats.reports, icon: Activity, color: "text-destructive" },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleApprove = async (vendorId: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`http://localhost:5000/api/vendor/${vendorId}/approve`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);

            if (!response.ok) {
                throw new Error("Failed to approve vendor");
            }

            toast({
                title: "Success",
                description: "Vendor approved successfully",
            });

            // Refresh the list
            await fetchPendingVendors();
        } catch (error) {
            console.error("Error approving vendor:", error);
            toast({
                title: "Error",
                description: "Failed to approve vendor",
                variant: "destructive",
            });
        }
    };

    const handleRejectClick = (vendorId: string) => {
        setRejectingVendor(vendorId);
        setRejectionReason("");
    };

    const handleCancelReject = () => {
        setRejectingVendor(null);
        setRejectionReason("");
    };

    const handleSubmitRejection = async () => {
        if (!rejectionReason.trim()) {
            toast({
                title: "Error",
                description: "Please provide a reason for rejection",
                variant: "destructive",
            });
            return;
        }

        setSubmittingRejection(true);
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`http://localhost:5000/api/vendors/${rejectingVendor}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (!response.ok) {
                throw new Error("Failed to reject vendor");
            }

            toast({
                title: "Success",
                description: "Vendor rejected successfully",
            });

            // Close the dialog and refresh the list
            setRejectingVendor(null);
            setRejectionReason("");
            fetchPendingVendors();
        } catch (error) {
            console.error("Error rejecting vendor:", error);
            toast({
                title: "Error",
                description: "Failed to reject vendor",
                variant: "destructive",
            });
        } finally {
            setSubmittingRejection(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Panel</h1>
                    <p className="text-muted-foreground">Manage users, vendors, and platform activities</p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsData.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content */}
                <Tabs defaultValue="vendors" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="vendors">Vendor Approvals</TabsTrigger>
                        <TabsTrigger value="products">Product Reviews</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="logs">Activity Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="vendors">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Vendor Applications</CardTitle>
                                <CardDescription>Review and approve new seller accounts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : pendingVendors.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-12">
                                        No pending vendor applications at the moment
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingVendors.map((vendor) => (
                                            <div key={vendor._id}>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="font-semibold text-lg">
                                                            {vendor.businessName}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Owner: {vendor.user.fullName} • {vendor.user.email}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Applied: {formatDate(vendor.createdAt)}
                                                        </div>
                                                        {vendor.description && (
                                                            <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                                                                {vendor.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 sm:flex-col lg:flex-row">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleApprove(vendor._id)}
                                                            className="flex-1 sm:flex-initial"
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleRejectClick(vendor._id)}
                                                            className="flex-1 sm:flex-initial"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Rejection Reason Card */}
                                                {rejectingVendor === vendor._id && (
                                                    <Card className="mt-4 border-2 border-destructive">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex items-center justify-between">
                                                                <CardTitle className="text-lg">Reject Vendor Application</CardTitle>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={handleCancelReject}
                                                                    className="h-6 w-6"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <CardDescription>
                                                                Please provide a reason for rejecting <strong>{vendor.businessName}</strong>
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                                                                <Textarea
                                                                    id="rejection-reason"
                                                                    placeholder="Enter the reason for rejection..."
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    rows={4}
                                                                    className="resize-none"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 justify-end">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={handleCancelReject}
                                                                    disabled={submittingRejection}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={handleSubmitRejection}
                                                                    disabled={submittingRejection || !rejectionReason.trim()}
                                                                >
                                                                    {submittingRejection ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            Rejecting...
                                                                        </>
                                                                    ) : (
                                                                        "Confirm Rejection"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Approval Queue</CardTitle>
                                <CardDescription>Review newly listed products before they go live</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center py-12">
                                    No pending product reviews at the moment
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>View and manage all platform users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center py-12">
                                    User management interface coming soon
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="logs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Logs</CardTitle>
                                <CardDescription>Monitor platform activities and events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center py-12">
                                    Activity logs will be displayed here
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminPanel;