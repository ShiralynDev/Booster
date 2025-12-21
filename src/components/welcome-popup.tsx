"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("booster-visited");
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleExplore = () => {
    localStorage.setItem("booster-visited", "true");
    setIsOpen(false);
  };

  const handleGoToWelcome = () => {
    localStorage.setItem("booster-visited", "true");
    setIsOpen(false);
    router.push("/welcome");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-none">
        <div className="relative flex flex-col items-center justify-center p-8 bg-background/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5">
            
            {/* Decorative background glow */}

            <div className="relative z-10 flex flex-col items-center text-center space-y-8 w-full">
                
                {/* Logo */}
                <div className="relative transform hover:scale-105 transition-transform duration-500">
                    <div className="absolute -inset-6 bg-primary/20 blur-xl rounded-full opacity-50 animate-pulse" />
                    <Image 
                        src="/BoosterLongLogo.tmp.png" 
                        alt="Booster" 
                        width={200} 
                        height={60} 
                        className="h-12 w-auto object-contain relative z-10 drop-shadow-lg"
                    />
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Welcome to the Future
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px] mx-auto">
                        Discover a new way to create, share, and earn. How would you like to start?
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full pt-2">
                    <Button 
                        onClick={handleGoToWelcome} 
                        className="w-full group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(var(--primary),0.4)] hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        <span className="flex items-center justify-center gap-2 text-base">
                            Take the Tour
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        onClick={handleExplore}
                        className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300"
                    >
                        <span className="flex items-center justify-center gap-2 text-sm font-medium">
                            Just Explore
                        </span>
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
