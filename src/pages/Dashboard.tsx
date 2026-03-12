import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Film, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">My Videos</h1>
          <Button onClick={() => navigate("/studio")}>
            New Video
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Empty state */}
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Film className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display text-lg font-semibold mb-2">No videos yet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first AI avatar animation to see it here.
          </p>
          <Button variant="outline" onClick={() => navigate("/studio")}>
            Go to Studio
          </Button>
        </div>
      </div>
    </div>
  );
}
