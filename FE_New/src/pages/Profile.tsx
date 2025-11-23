import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    ShieldCheck,
    Store,
    Loader2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import {toast} from "sonner";

const Profile = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [vendorRegistered, setVendorRegistered] = useState(false);
    const [error, setError] = useState("");

    // Helper to generate initials for the avatar
    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#333333]">
                <p className="text-lg">Please log in to view your profile.</p>
            </div>
        );
    }

    const handleStartSelling = async () => {
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
            });

            const data = await res.json();

            if(res.status === 401){
                localStorage.removeItem("accessToken");
                toast({
                    title: "Session Expired!",
                    description: "Session expired. Please log in again.",
                });
                navigate("/login");

            }
            if (!res.ok) {
                setError(data.error || "Failed to register as vendor");
                setLoading(false);
                return;
            }

            setVendorRegistered(true);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Unable to connect to server");
            setLoading(false);
        }
    };

    const isVendor = user.role === "VENDOR" || vendorRegistered;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* 1. Header Banner - HCMUT Maroon */}
            <div className="h-48 bg-[#870000] w-full relative overflow-hidden">
                {/* Decorative abstract circle for visual flair */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>

            {/* 2. Main Content Container (Overlapping the banner) */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12 relative z-10">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* Top Section: Avatar & Basic Info */}
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 border-b border-gray-100">
                        {/* Avatar Circle */}
                        <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg -mt-16 sm:-mt-0 ring-4 ring-white">
                            <div className="w-full h-full rounded-full bg-[#333333] flex items-center justify-center text-white text-3xl font-bold">
                                {getInitials(user.fullName)}
                            </div>
                        </div>

                        {/* Name & Role */}
                        <div className="flex-1 text-center sm:text-left mb-2">
                            <h1 className="text-3xl font-bold text-[#333333] mb-1">
                                {user.fullName}
                            </h1>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                                    isVendor
                                        ? "bg-teal-50 text-teal-700 border-teal-200"
                                        : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}>
                                    {isVendor ? "VENDOR ACCOUNT" : user.role}
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
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                <div className="flex items-center gap-3 mt-1 text-[#333333] font-medium">
                                    <Mail className="w-4 h-4 text-[#870000]" />
                                    {user.email}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account ID</label>
                                <div className="flex items-center gap-3 mt-1 text-[#333333] font-medium">
                                    <ShieldCheck className="w-4 h-4 text-[#870000]" />
                                    {user.id || "N/A"} {/* Assuming user has an ID */}
                                </div>
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
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {vendorRegistered && (
                                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2">
                                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-2 text-teal-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-teal-800 text-lg">Registration Successful!</h3>
                                    <p className="text-teal-600">You can now start listing products on the marketplace.</p>
                                </div>
                            )}

                            {/* Call to Action Button */}
                            {!isVendor && (
                                <div className="bg-gradient-to-r from-[#333333] to-[#1a1a1a] rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">Become a Seller</h3>
                                        <p className="text-gray-400 text-sm">Join our marketplace and start selling your products today.</p>
                                    </div>
                                    <Button
                                        onClick={handleStartSelling}
                                        disabled={loading}
                                        className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold px-6 py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[160px]"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            "Start Selling"
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* View Dashboard Button (if already a vendor) */}
                            {isVendor && !vendorRegistered && (
                                <Button className="w-full sm:w-auto bg-[#870000] hover:bg-[#6b0000] text-white">
                                    Go to Vendor Dashboard
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;