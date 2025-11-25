import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import heroImage from "@/assets/hero-marketplace.jpg";

// Interface reflecting your Backend Data Structure
interface ProductData {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string | { name: string };
    images: string[] | { url: string }[];
    vendor: { businessName: string };
    createdAt: string;
}

const Index = () => {
    const { user } = useAuth();

    // State for API Data
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Products on Mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetching from the API you specified
                const token = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:5000/api/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                console.log("Fetched Products:", result);

                if (result.success) {
                    // Sort by newest and take the top 3-6 for the homepage
                    const sorted = result.data.sort((a: ProductData, b: ProductData) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setProducts(sorted.slice(0, 3)); // Only show top 3
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Helper to process Image URLs from backend
    const getImageUrl = (product: ProductData) => {
        if (!product.images || product.images.length === 0) return "https://placehold.co/400x300?text=No+Image";

        const firstImg = product.images[0];
        let url = typeof firstImg === 'string' ? firstImg : firstImg.url;

        // Fix localhost pathing
        if (url && !url.startsWith('http')) {
            return `http://localhost:5000${url.replace('/uploads', '/static')}`;
        }
        return url;
    };

    // Helper to process Category Name safely
    const getCategoryName = (category: string | { name: string } | null) => {
        if (!category) return "General";
        if (typeof category === 'object') return category.name;
        return category;
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar/>

            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <div className="container mx-auto px-4 py-20 md:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            {!user && (
                                <div className="inline-block">
                                    <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-1">
                                        Exclusive for HCMUT Students
                                    </Badge>
                                </div>
                            )}

                            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                {user ? (
                                    <>
                                        Welcome,{" "}
                                        <span className="text-primary block">{user.fullName}</span>
                                    </>
                                ) : (
                                    <>
                                        Your Campus
                                        <span className="text-primary block">Marketplace</span>
                                    </>
                                )}
                            </h1>

                            <p className="text-lg text-muted-foreground max-w-lg">
                                {user
                                    ? "Explore the best deals from HCMUT students."
                                    : "Buy, sell, and trade safely within the HCMUT community. From textbooks to tech, find everything you need from fellow students."}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4">
                                {user ? (
                                    <Button size="lg" asChild>
                                        <Link to="/marketplace">
                                            Go to Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button size="lg" variant="default" asChild>
                                            <Link to="/marketplace">
                                                Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                        <Button size="lg" variant="gold" asChild>
                                            <Link to="/signup">Register now</Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            {!user && (
                                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                                    <div>
                                        <div className="text-2xl font-bold text-primary">500+</div>
                                        <div className="text-sm text-muted-foreground">Active Users</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">1,200+</div>
                                        <div className="text-sm text-muted-foreground">Products</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">98%</div>
                                        <div className="text-sm text-muted-foreground">Satisfaction</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src={heroImage}
                                    alt="HCMUT students trading on campus"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border border-border max-w-xs">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-accent" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Safe & Verified</div>
                                        <div className="text-sm text-muted-foreground">All users verified</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-card/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Built specifically for the HCMUT community with safety and convenience in mind
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="h-8 w-8 text-primary" />}
                            title="Verified Students Only"
                            text="All sellers and buyers are verified HCMUT students, ensuring a trusted community"
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8 text-accent" />}
                            title="Campus Community"
                            text="Meet face-to-face on campus for safe exchanges and build connections"
                        />
                        <FeatureCard
                            icon={<Zap className="h-8 w-8 text-primary" />}
                            title="Quick & Easy"
                            text="List items in minutes and connect with buyers instantly through our platform"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Products (DYNAMIC) */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Items</h2>
                            <p className="text-muted-foreground">Newest products from fellow students</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="/marketplace">View All</Link>
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        image={getImageUrl(product)}
                                        title={product.name}
                                        price={product.price}
                                        rating={5.0} // Default rating if API doesn't have it
                                        seller={product.vendor?.businessName || "Unknown Seller"}
                                    />
                                ))
                            ) : (
                                <p className="col-span-3 text-center text-muted-foreground py-10">
                                    No products found. Be the first to list something!
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            {!user && (
                <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                            Ready to Start Trading?
                        </h2>
                        <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                            Join hundreds of HCMUT students already buying and selling on our platform
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button size="lg" variant="gold" asChild>
                                <Link to="/signup">Create Account</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                                asChild
                            >
                                <Link to="/login">Sign In</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-border py-12 bg-card">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2025 HCMUT Marketplace. Built for students, by students.
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, text }) => (
    <div className="text-center space-y-4 p-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{text}</p>
    </div>
);

export default Index;