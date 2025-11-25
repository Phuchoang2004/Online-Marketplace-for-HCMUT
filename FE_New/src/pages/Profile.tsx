import { useState, useEffect } from "react"; // Added useEffect
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    User,
    Mail,
    ShieldCheck,
    Store,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock, // Added Clock icon
    X, Package
} from "lucide-react";
import { Navbar } from "@/components/Navbar.tsx";

interface VendorFormData {
    business_name: string;
    description: string;
}

const Profile = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Tracks if user just submitted the form successfully OR if we found an existing request from API
    const [vendorRegistered, setVendorRegistered] = useState(false);

    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false); // Loading state for the initial check

    const [formData, setFormData] = useState<VendorFormData>({
        business_name: "",
        description: ""
    });
    const [formErrors, setFormErrors] = useState<{
        business_name?: string;
        description?: string;
    }>({});

    // --- NEW: Check for existing vendor application on mount ---
    useEffect(() => {
        const checkVendorStatus = async () => {
            if (!user || user.role === "VENDOR") return;

            setCheckingStatus(true);
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch("http://localhost:5000/api/vendors", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    // Assumption: If the API returns data (not null/empty),
                    // it means a request exists.
                    if (data && data.data.length > 0) {
                        setVendorRegistered(true);
                    }
                }
            } catch (err) {
                console.error("Error checking vendor status:", err);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkVendorStatus();
    }, [user]);
    // ---------------------------------------------------------

    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";
    };

    const validateForm = () => {
        const errors: {
            business_name?: string;
            description?: string;
        } = {};
        if (!formData.business_name.trim()) {
            errors.business_name = "Business name is required";
        }
        if (!formData.description.trim()) {
            errors.description = "Description is required";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleStartSelling = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:5000/api/vendor/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.status === 401) {
                localStorage.removeItem("accessToken");
                toast({
                    title: "Session Expired!",
                    description: "Session expired. Please log in again.",
                });
                navigate("/login");
                return;
            }

            if (!res.ok) {
                console.log(data);
                setError(data.error || "Failed to register as vendor");
                setLoading(false);
                return;
            }
            toast({
                title: "Vendor Registration Successful!",
                description: "Your account has been registered as a vendor. Please wait for approval from the admin.",
            })

            setVendorRegistered(true);
            setShowForm(false);
            setLoading(false);

            setFormData({
                business_name: "",
                description: ""
            });
        } catch (err) {
            console.error(err);
            setError("Unable to connect to server");
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#333333]">
                <div className="text-center">
                    <p className="text-lg mb-4">Please log in to view your profile.</p>
                    <Button
                        onClick={() => navigate("/login")}
                        className="bg-[#870000] hover:bg-[#6b0000] text-white"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // Determine if user is effectively a vendor (approved)
    const isApprovedVendor = user.role === "VENDOR";

    return (
        <><Navbar />
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* 1. Header Banner - HCMUT Maroon */}
                <div className="h-48 bg-[#870000] w-full relative overflow-hidden">
                    <div
                        className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                </div>

                {/* 2. Main Content Container */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12 relative z-10">

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                        {/* Top Section: Avatar & Basic Info */}
                        <div
                            className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 border-b border-gray-100">
                            <div
                                className="w-32 h-32 rounded-full bg-white p-1 shadow-lg -mt-16 sm:-mt-0 ring-4 ring-white">
                                <div
                                    className="w-full h-full rounded-full bg-[#333333] flex items-center justify-center text-white text-3xl font-bold">
                                    {getInitials(user.fullName)}
                                </div>
                            </div>

                            <div className="flex-1 text-center sm:text-left mb-2">
                                <h1 className="text-3xl font-bold text-[#333333] mb-1">
                                    {user.fullName}
                                </h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${isApprovedVendor
                                            ? "bg-teal-50 text-teal-700 border-teal-200"
                                            : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                        {isApprovedVendor ? "VENDOR ACCOUNT" : user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="p-6 sm:p-8 grid gap-6">
                            <h2 className="text-xl font-semibold text-[#333333] flex items-center gap-2">
                                <User className="w-5 h-5 text-[#870000]" />
                                Personal Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email
                                        Address</label>
                                    <div className="flex items-center gap-3 mt-1 text-[#333333] font-medium">
                                        <Mail className="w-4 h-4 text-[#870000]" />
                                        {user.email}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account
                                        ID</label>
                                    <div className="flex items-center gap-3 mt-1 text-[#333333] font-medium">
                                        <ShieldCheck className="w-4 h-4 text-[#870000]" />
                                        {user.id || "N/A"}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h2 className="text-xl font-semibold text-[#333333] flex items-center gap-2 mb-4">
                                    <Package className="w-5 h-5 text-[#870000]" />
                                    Order History
                                </h2>
                                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <h3 className="font-bold text-[#333333] text-lg">My Purchases</h3>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Track your orders, view details, and manage returns.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => navigate("/myorder")}
                                        className="bg-white text-[#870000] border-2 border-[#870000] hover:bg-[#870000] hover:text-white font-semibold transition-all min-w-[150px] py-2"
                                    >
                                        View My Orders
                                    </Button>
                                </div>
                            </div>

                            {/* Vendor Action Section */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h2 className="text-xl font-semibold text-[#333333] flex items-center gap-2 mb-4">
                                    <Store className="w-5 h-5 text-[#870000]" />
                                    Vendor Status
                                </h2>

                                {/* Error Message */}
                                {error && (
                                    <div
                                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                {/* Loading state for initial check */}
                                {checkingStatus && (
                                    <div className="flex items-center gap-2 text-gray-500 py-4">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Checking registration status...</span>
                                    </div>
                                )}

                                {!checkingStatus && !isApprovedVendor && vendorRegistered && (
                                    <div
                                        className="p-5 bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2">
                                        <div
                                            className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 text-amber-600">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-amber-800 text-lg">Application Pending</h3>
                                        <p className="text-amber-700 mt-1">
                                            You have already registered. Please wait for approval from the admin.
                                        </p>
                                    </div>
                                )}

                                {/* Case 2: Show Form */}
                                {!checkingStatus && !isApprovedVendor && !vendorRegistered && showForm && (
                                    <div className="bg-white border-2 border-[#870000] rounded-xl p-6 shadow-lg mb-4 animate-in zoom-in-95">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-xl text-[#333333]">Vendor Registration</h3>
                                            <button
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setError("");
                                                    setFormErrors({});
                                                }}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleStartSelling} className="space-y-4">
                                            <div>
                                                <label htmlFor="business_name"
                                                       className="block text-sm font-semibold text-[#333333] mb-2">
                                                    Business Name <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    id="business_name"
                                                    name="business_name"
                                                    type="text"
                                                    value={formData.business_name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your business name"
                                                    className={`w-full ${formErrors.business_name ? 'border-red-500' : ''}`} />
                                                {formErrors.business_name && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.business_name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="description"
                                                       className="block text-sm font-semibold text-[#333333] mb-2">
                                                    Business Description <span className="text-red-500">*</span>
                                                </label>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Describe your business and what you plan to sell..."
                                                    rows={4}
                                                    className={`w-full resize-none ${formErrors.description ? 'border-red-500' : ''}`} />
                                                {formErrors.description && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                                                )}
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-6"
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Submitting...
                                                        </div>
                                                    ) : (
                                                        "Submit Registration"
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowForm(false);
                                                        setError("");
                                                        setFormErrors({});
                                                    }}
                                                    variant="outline"
                                                    className="px-6"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Case 3: Show CTA Button (Start Selling) */}
                                {!checkingStatus && !isApprovedVendor && !vendorRegistered && !showForm && (
                                    <div
                                        className="bg-gradient-to-r from-[#333333] to-[#1a1a1a] rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">Become a Seller</h3>
                                            <p className="text-gray-400 text-sm">Join our marketplace and start selling
                                                your products today.</p>
                                        </div>
                                        <Button
                                            onClick={() => setShowForm(true)}
                                            className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold px-6 py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[160px]"
                                        >
                                            Start Selling
                                        </Button>
                                    </div>
                                )}

                                {/* Case 4: Approved Vendor Dashboard Link */}
                                {isApprovedVendor && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between bg-teal-50 p-6 rounded-xl border border-teal-100">
                                        <div className="mb-4 sm:mb-0">
                                            <h3 className="font-bold text-teal-900 text-lg">Vendor Dashboard</h3>
                                            <p className="text-teal-700 text-sm">Manage your products and orders.</p>
                                        </div>
                                        <Button onClick={() => navigate("/seller/dashboard")} className="w-full sm:w-auto bg-[#870000] hover:bg-[#6b0000] text-white">
                                            Go to Vendor Dashboard
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;