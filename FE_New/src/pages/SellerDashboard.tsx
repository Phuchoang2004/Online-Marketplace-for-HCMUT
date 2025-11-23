import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, TrendingUp, Plus, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SellerDashboard = () => {
  const stats = [
    {
      title: "Total Sales",
      value: "45,230,000đ",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-accent"
    },
    {
      title: "Active Listings",
      value: "12",
      change: "+2",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Pending Orders",
      value: "3",
      change: "0",
      icon: Clock,
      color: "text-muted-foreground"
    },
    {
      title: "Completed",
      value: "48",
      change: "+8",
      icon: CheckCircle,
      color: "text-accent"
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      product: "MacBook Pro 2021",
      buyer: "Nguyen Van A",
      amount: 25000000,
      status: "pending",
      date: "2025-11-06"
    },
    {
      id: "ORD-002",
      product: "Engineering Books",
      buyer: "Tran Thi B",
      amount: 500000,
      status: "completed",
      date: "2025-11-05"
    },
    {
      id: "ORD-003",
      product: "Student Backpack",
      buyer: "Le Van C",
      amount: 800000,
      status: "shipped",
      date: "2025-11-04"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and track your sales</p>
          </div>
          <Button size="lg" variant="gold">
            <Plus className="mr-2 h-5 w-5" />
            Add New Listing
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-accent font-medium">{stat.change}</span> from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your seller account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Package className="h-6 w-6" />
                <span>My Listings</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Plus className="h-6 w-6" />
                <span>Add Product</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span>Orders</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest sales and order status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{order.product}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.id} • {order.buyer} • {order.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">{order.amount.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">View All Orders</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
