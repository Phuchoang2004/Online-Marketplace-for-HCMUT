import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import {
    ArrowLeft,
    Loader2,
    ShoppingCart,
    Store,
    Tag,
    Clock,
    CheckCircle2,
    XCircle,
    Minus,
    Plus
} from "lucide-react";
import {toast} from "sonner";

// 1. Define Interfaces
interface Vendor {
    _id: string;
    businessName: string;
    approvalStatus: string;
}

interface Category {
    _id: string;
    name: string;
}

interface ProductImage {
    url: string;
    _id?: string;
}

interface ProductDetail {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: ProductImage[];
    category: Category;
    vendor: Vendor;
    approvalStatus: string;
    createdAt: string;
    updatedAt: string;
}

const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://placehold.co/600x600?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    const formattedPath = imagePath.replace('/uploads', '/static');
    return `http://localhost:5000${formattedPath}`;
};

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // Renamed to avoid conflict

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mainImage, setMainImage] = useState<string>("");

    // New State for Cart Functionality
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProductDetail(id);
        }
    }, [id]);

    const fetchProductDetail = async (productId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5000/api/products/${productId}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const result = await response.json();

            if (result.success && result.product) {
                setProduct(result.product);
                if (result.product.images && result.product.images.length > 0) {
                    setMainImage(result.product.images[0].url);
                }
            } else {
                setError("Product not found");
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Failed to load product details");
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Handle Quantity Change ---
    const handleQuantityChange = (type: 'increase' | 'decrease') => {
        if (!product) return;
        if (type === 'increase' && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // --- NEW: Add to Cart API Call ---
    const addToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!product) return;

        setIsAdding(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: quantity
                })
            });

            const data = await response.json();
            console.log("Add to Cart Response:", data);
            if (response.ok) {
                setProduct(prevState => ({
                    ...prevState,
                    stock: prevState.stock - quantity
                }));
                setQuantity(1);
                // You can replace this with a Toast notification if you have one installed
                toast.success("Product added to cart successfully!");
            } else {
                alert(data.message || "Failed to add to cart");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            alert("Network error. Please try again.");
        } finally {
            setIsAdding(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-[#870000]" />
            </div>
        );
    }

    if (error || !product) {
        if(!user){
            return <Navigate to="/login" replace />;
        }
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
                    <p className="text-muted-foreground mb-6">{error || "Product not found"}</p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 hover:bg-transparent hover:text-[#870000]"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Listings
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* LEFT COLUMN: Images */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardContent className="p-0">
                                <div className="aspect-square relative bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg border">
                                    <img
                                        src={getImageUrl(mainImage)}
                                        alt={product.name}
                                        className="object-cover w-full h-full"
                                        onError={(e) => (e.currentTarget.src = "https://placehold.co/600x600?text=Error")}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setMainImage(img.url)}
                                        className={`
                                            relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 
                                            ${mainImage === img.url ? "border-[#870000]" : "border-transparent hover:border-gray-300"}
                                        `}
                                    >
                                        <img
                                            src={getImageUrl(img.url)}
                                            alt={`Thumbnail ${index}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Details */}
                    <div className="flex flex-col h-full">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-muted-foreground">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {product.category?.name || "Uncategorized"}
                                </Badge>
                                <Badge
                                    className={`${
                                        product.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                            product.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                                'bg-red-100 text-red-700 hover:bg-red-100'
                                    }`}
                                >
                                    {product.approvalStatus}
                                </Badge>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>

                            <div className="flex items-center text-sm text-muted-foreground mb-6">
                                <Store className="h-4 w-4 mr-1" />
                                <span className="mr-1">Sold by:</span>
                                <span className="font-semibold text-gray-700 underline cursor-pointer">
                                    {product.vendor?.businessName}
                                </span>
                            </div>

                            <div className="text-3xl font-bold text-[#870000] mb-6">
                                {product.price.toLocaleString('vi-VN')}đ
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-8">
                                {product.stock > 0 ? (
                                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        In Stock ({product.stock} units)
                                    </div>
                                ) : (
                                    <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Out of Stock
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Action Area - Updated */}
                        <div className="mt-auto space-y-4">
                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-gray-700">Quantity:</span>
                                    <div className="flex items-center border rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-r-none"
                                            onClick={() => handleQuantityChange('decrease')}
                                            disabled={quantity <= 1 || isAdding}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <div className="h-9 w-12 flex items-center justify-center border-l border-r font-medium">
                                            {quantity}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-l-none"
                                            onClick={() => handleQuantityChange('increase')}
                                            disabled={quantity >= product.stock || isAdding}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {product.stock} available
                                    </span>
                                </div>
                            )}

                            {/* Add to Cart Button */}
                            <div className="flex gap-4">
                                <Button
                                    size="lg"
                                    className="flex-1 bg-[#870000] hover:bg-[#600000]"
                                    onClick={addToCart}
                                    disabled={product.stock === 0 || isAdding}
                                >
                                    {isAdding ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                        </>
                                    )}
                                </Button>
                                <Button size="lg" variant="outline" className="flex-1">
                                    Contact Vendor
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Listed on {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;