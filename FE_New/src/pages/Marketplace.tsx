import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
    _id: string;
    name: string;
}

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string | { name: string };
    images: string[] | { url: string }[];
    vendor: { businessName: string };
    createdAt: string;
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const Marketplace = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationData | null>(null);

    const [priceRange, setPriceRange] = useState([0, 50000000]);

    const [filters, setFilters] = useState({
        keyword: "",
        category: "all",
        sortBy: "newest",
        page: 1
    });

    const [searchTerm, setSearchTerm] = useState("");

    const getImageUrl = (product: Product) => {
        if (!product.images || product.images.length === 0) return "https://placehold.co/400x300?text=No+Image";
        const firstImg = product.images[0];
        let url = typeof firstImg === 'string' ? firstImg : firstImg.url;
        if (url && !url.startsWith('http')) {
            return `http://localhost:5000${url.replace('/uploads', '/static')}`;
        }
        return url;
    };

    const getCategoryName = (category: string | { name: string } | null) => {
        if (!category) return "General";
        if (typeof category === 'object') return category.name;
        return category;
    };

    // Helper to format currency for the slider labels
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Categories usually don't need Auth, but if your API requires it, keep the header
                const token = localStorage.getItem('accessToken');
                const res = await fetch('http://localhost:5000/api/categories',{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success) setCategories(data.data);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setFilters(prev => ({ ...prev, keyword: searchTerm, page: 1 }));
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.keyword) params.append("keyword", filters.keyword);
                if (filters.category && filters.category !== "all") params.append("category", filters.category);

                // Add Price Params
                if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
                if (priceRange[1] < 50000000) params.append("maxPrice", priceRange[1].toString());

                params.append("sortBy", filters.sortBy);
                params.append("page", filters.page.toString());
                params.append("limit", "12");
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();

                if (result.success) {
                    setProducts(result.data);
                    setPagination(result.pagination);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, [filters, priceRange]);

    const handleCategoryChange = (value: string) => {
        setFilters(prev => ({ ...prev, category: value, page: 1 }));
    };

    const handleSortChange = (value: string) => {
        setFilters(prev => ({ ...prev, sortBy: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleReset = () => {
        setSearchTerm("");
        setPriceRange([0, 50000000]); // Reset price
        setFilters({ keyword: "", category: "all", sortBy: "newest", page: 1 });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Marketplace</h1>
                    <p className="text-muted-foreground">Discover great deals from fellow HCMUT students</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 space-y-6">
                        <Card className="p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <SlidersHorizontal className="h-5 w-5" />
                                    Filters
                                </h2>
                                <Button variant="ghost" size="sm" onClick={handleReset}>Reset</Button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Category</Label>
                                    <Select value={filters.category} onValueChange={handleCategoryChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* --- 3. ENABLE SLIDER AND ADD HANDLER --- */}
                                <div className="space-y-3">
                                    <Label>Price Range</Label>
                                    <Slider
                                        value={priceRange}
                                        min={0}
                                        max={50000000}
                                        step={500000}
                                        className="mt-2"
                                        // Use onValueCommit to fetch only when user releases the handle
                                        onValueCommit={(val) => setPriceRange(val)}
                                        // Or use onValueChange for live updates (might cause too many requests)
                                        onValueChange={(val) => setPriceRange(val)}
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <span>{formatCurrency(priceRange[0])}</span>
                                        <span>{formatCurrency(priceRange[1])}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Sort By</Label>
                                    <Select value={filters.sortBy} onValueChange={handleSortChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="price">Price: Low to High</SelectItem>
                                            <SelectItem value="popularity">Most Popular</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    </aside>

                    <div className="lg:col-span-3">
                        {/* Search and Grid (Same as before) */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search for products..."
                                    className="pl-10 h-12 text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{products.length}</span> results
                                {pagination && ` of ${pagination.total}`}
                            </p>
                            {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                        </div>

                        {loading && products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-lg font-medium text-gray-900">No products found</p>
                                <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                                <Button variant="link" onClick={handleReset} className="mt-2">Clear all filters</Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        image={getImageUrl(product)}
                                        title={product.name}
                                        price={product.price}
                                        category={getCategoryName(product.category)}
                                        rating={5.0}
                                        seller={product.vendor?.businessName || "Unknown Seller"}
                                    />
                                ))}
                            </div>
                        )}

                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page <= 1 || loading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="text-sm font-medium">
                                    Page {filters.page} of {pagination.totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page >= pagination.totalPages || loading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;