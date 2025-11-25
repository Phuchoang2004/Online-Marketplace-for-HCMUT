import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    ArrowLeft,
    PackageOpen
} from "lucide-react";
import {Navigate, useNavigate} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Interface matching your Product Schema structure
interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    createdAt: string;
    approvalStatus: string;
}

const ListProducts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();


    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                setError("Authentication token not found");
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/vendor/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            console.log("Fetched Products:", result);
            if (result.success) {
                setProducts(result.data);
            } else {
                setError(result.errors || "Failed to load products");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if(!window.confirm("Are you sure you want to delete this product?")) return;

        // Example delete implementation
        /*
        const token = localStorage.getItem('accessToken');
        await fetch(`http://localhost:5000/api/products/${id}`, {
             method: 'DELETE',
             headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts(); // Refresh list
        */
        console.log("Delete product:", id);
    };

    if (loading) {
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
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                            onClick={() => navigate('/seller/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold">My Listings</h1>
                        <p className="text-muted-foreground">Manage your product catalog</p>
                    </div>
                    <Button
                        size="lg"
                        variant="gold"
                        onClick={() => navigate('/vendor/add-product')}
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Add New Product
                    </Button>
                </div>

                {/* Filters and Search */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Table */}
                <Card>
                    <CardHeader className="px-6 py-4 border-b">
                        <CardTitle className="text-lg">Products ({products.length})</CardTitle>
                        <CardDescription>A list of all products you are currently selling.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {error && <div className="p-4 text-red-500">{error}</div>}

                        {products.length === 0 && !error ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <PackageOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    You haven't added any products yet. Start selling by adding your first item.
                                </p>
                                <Button variant="outline" onClick={() => navigate('/vendor/add-product')}>
                                    Add Product
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => (
                                        <TableRow key={product._id}>
                                            <TableCell>
                                                <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.name}
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {product._id}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">
                                                    {product.category || "General"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {product.price.toLocaleString('vi-VN')}đ
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={product.stock > 0 ? "outline" : "destructive"}
                                                    className={product.stock > 0 ? "text-green-600 border-green-200 bg-green-50" : ""}
                                                >
                                                    {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={product.approvalStatus == 'PENDING' ? "outline" : "secondary"}
                                                    className={product.approvalStatus == 'APPROVED' ? "text-green-600 border-green-200 bg-green-50" : "text-yellow-600 border-yellow-200 bg-yellow-50"}
                                                >
                                                    {product.approvalStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/vendor/edit-product/${product._id}`)}
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(product._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ListProducts;