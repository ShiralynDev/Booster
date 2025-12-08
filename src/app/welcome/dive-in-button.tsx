'use client'

import { Button } from "@/components/ui/button"
import { diveIn } from "./actions"
import { ArrowRight } from "lucide-react"

export function DiveInButton() {
  return (
    <Button 
      onClick={() => diveIn()} 
      size="lg" 
      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      Dive In
      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
    </Button>
  )
}
