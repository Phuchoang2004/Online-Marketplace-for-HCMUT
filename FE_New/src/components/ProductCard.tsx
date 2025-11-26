import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {useNavigate} from "react-router-dom";

interface ProductCardProps {
    id: string;
  image: string;
  title: string;
  price: number;
  rating?: number;
  category?: string;
  seller?: string;
}

export const ProductCard = ({
    id,
  image, 
  title, 
  price, 
  rating = 4.5, 
  category = "Electronics",
  seller = "Student Seller"
}: ProductCardProps) => {
    const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2 text-xs">
          {category}
        </Badge>
        <h3 className="font-semibold text-base line-clamp-2 mb-2">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="font-medium">{rating}</span>
          <span className="mx-1">•</span>
          <span>{seller}</span>
        </div>
        <p className="text-2xl font-bold text-primary">{price.toLocaleString('vi-VN')}đ</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline" onClick={() => navigate(`/product/${id}`)}>View Details</Button>
      </CardFooter>
    </Card>
  );
};
