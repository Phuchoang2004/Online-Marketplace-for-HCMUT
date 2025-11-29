import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import SellerDashboard from "./pages/SellerDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Profile from "@/pages/Profile.tsx";
import Unauthorized from "@/pages/UnauthorizedPage.tsx";
import Cart from "@/pages/Cart.tsx";
import MyOrders from "@/pages/MyOrders.tsx";
import ListProduct from "@/pages/ListProduct.tsx";
import AddProduct from "@/pages/AddProduct.tsx";
import ProductDetail from "@/pages/ProductDetail.tsx";
import VendorOrders from "@/pages/VendorOrders.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/unauthorized" element={<Unauthorized/>}/>
            <Route path="/mycart" element={<Cart/>} />
            <Route path="/myorder" element={<MyOrders/>}/>
            <Route path="/vendor/products" element={<ListProduct/>} />
            <Route path="/vendor/products/add" element={<AddProduct/>} />
            <Route path="/product/:id" element={<ProductDetail/>} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
