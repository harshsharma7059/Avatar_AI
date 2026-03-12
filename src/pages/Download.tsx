import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download as DownloadIcon, ArrowRight } from "lucide-react";

export default function DownloadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { prompt?: string } | null;

  if (!state?.prompt) {
    navigate("/studio");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-lg pt-24 pb-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>

        <h1 className="font-display text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">Your 4K video is ready to download</p>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4 mb-8">
          <div className="relative aspect-video rounded-lg bg-secondary flex items-center justify-center">
            <Badge className="absolute top-3 left-3 bg-success text-success-foreground">
              4K FULL
            </Badge>
            <p className="text-muted-foreground text-sm">Full quality video ready</p>
          </div>

          <Button className="w-full h-12 text-lg font-semibold" onClick={() => {
            // Mock download — in production, serve the actual file
            alert("Download started! (This is a mock — real file download would happen here)");
          }}>
            <DownloadIcon className="mr-2 h-5 w-5" />
            Download 4K Video
          </Button>
        </div>

        <Button variant="outline" onClick={() => navigate("/studio")}>
          Create another video
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
