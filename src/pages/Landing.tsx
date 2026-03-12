import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { PRICING, DURATION_LABELS, formatPrice, type DurationTier } from "@/lib/pricing";
import { Sparkles, Film, Zap, Crown, Users, PawPrint, Wand2 } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Realistic Characters", desc: "Human-like avatars with natural expressions and movements" },
  { icon: PawPrint, title: "Animals & Creatures", desc: "Bring any animal to life with smooth, lifelike animations" },
  { icon: Film, title: "4K Quality Output", desc: "Crystal-clear video at stunning 4K resolution" },
  { icon: Zap, title: "Lightning Fast", desc: "Generate your avatar video in seconds, not hours" },
];

const TIERS: DurationTier[] = ["1-5", "5-15", "15+"];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useCurrency();

  const handleGetStarted = () => {
    navigate(user ? "/studio" : "/signup");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(263_70%_58%/0.12),transparent_70%)]" />
        <div className="container relative z-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
            <Wand2 className="h-4 w-4" />
            AI-Powered Avatar Animations
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl md:text-8xl mb-6">
            Create <span className="text-gradient">Avatar AI</span>
            <br />
            Animations
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10">
            Transform your ideas into stunning animated avatar videos for YouTube.
            Realistic characters, animals, and more — powered by AI.
          </p>
          <Button
            size="lg"
            className="glow-purple glow-pulse h-14 px-10 text-lg font-semibold"
            onClick={handleGetStarted}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating Free
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <h2 className="font-display text-center text-3xl font-bold sm:text-4xl mb-16">
            Everything you need to create
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <h2 className="font-display text-center text-3xl font-bold sm:text-4xl mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-muted-foreground mb-16">
            Pay per video. No subscriptions.
          </p>
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
            {TIERS.map((tier, i) => (
              <div
                key={tier}
                className={`relative rounded-xl border p-6 text-center transition-colors ${
                  i === 1
                    ? "border-primary bg-primary/5 glow-purple"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    <Crown className="mr-1 inline h-3 w-3" />
                    Popular
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-2">{DURATION_LABELS[tier]}</p>
                <p className="font-display text-4xl font-bold mb-4">
                  {formatPrice(PRICING[tier][currency], currency)}
                </p>
                <Button
                  variant={i === 1 ? "default" : "outline"}
                  className="w-full"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Avatar AI</span>
          </div>
          <p>© {new Date().getFullYear()} Avatar AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
