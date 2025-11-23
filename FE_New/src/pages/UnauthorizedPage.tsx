import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4 max-w-md px-4">
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-destructive" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground text-lg">
                    You don't have permission to access this page. This area is restricted to administrators only.
                </p>
                <div className="flex gap-3 justify-center pt-4">
                    <Button onClick={() => navigate("/")} variant="default">
                        Return to Home
                    </Button>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;