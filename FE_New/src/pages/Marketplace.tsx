import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal } from "lucide-react";
import product1 from "@/assets/sample-product-1.jpg";
import product2 from "@/assets/sample-product-2.jpg";
import product3 from "@/assets/sample-product-3.jpg";

const Marketplace = () => {
  const products = [
    {
      image: product1,
      title: "MacBook Pro 2021 - Like New, Perfect for Students",
      price: 25000000,
      category: "Electronics",
      rating: 4.8,
      seller: "Nguyen Van A"
    },
    {
      image: product2,
      title: "Engineering Textbook Collection - Complete Set",
      price: 500000,
      category: "Books",
      rating: 4.5,
      seller: "Tran Thi B"
    },
    {
      image: product3,
      title: "Premium Student Backpack - Waterproof",
      price: 800000,
      category: "Accessories",
      rating: 4.7,
      seller: "Le Van C"
    },
    {
      image: product1,
      title: "iPad Air 2022 - Excellent Condition",
      price: 15000000,
      category: "Electronics",
      rating: 4.9,
      seller: "Pham Van D"
    },
    {
      image: product2,
      title: "Calculus & Linear Algebra Books",
      price: 300000,
      category: "Books",
      rating: 4.6,
      seller: "Hoang Thi E"
    },
    {
      image: product3,
      title: "Laptop Stand - Ergonomic Design",
      price: 400000,
      category: "Accessories",
      rating: 4.4,
      seller: "Nguyen Van F"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Marketplace</h1>
          <p className="text-muted-foreground">Discover great deals from fellow HCMUT students</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </h2>
                <Button variant="ghost" size="sm">Reset</Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Category</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Price Range</Label>
                  <Slider defaultValue={[0, 100]} max={100} step={1} className="mt-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0đ</span>
                    <span>50,000,000đ</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Sort By</Label>
                  <Select defaultValue="newest">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for products..."
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{products.length}</span> results
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <ProductCard key={index} {...product} />
              ))}
            </div>

            {/* Load More */}
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import Card component
import { Card } from "@/components/ui/card";

export default Marketplace;
