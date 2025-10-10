// Floating Sparkles component

import { Sparkles } from "lucide-react"

interface SparkleEffectProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({ className = "" }) => (
  <div className={`absolute pointer-events-none ${className}`}>
    <div className="animate-ping-slow">
      <Sparkles className="h-2 w-2 text-yellow-300" />
    </div>
  </div>
)

export const FloatingSparkles = () => {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3,
    size: 4 + Math.random() * 8,
    left: Math.random() * 100,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute animate-float-sparkle"
          style={{
            left: `${sparkle.left}%`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
          }}
        >
          <div 
            className="bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full blur-[1px]"
            style={{
              width: sparkle.size,
              height: sparkle.size,
            }}
          />
        </div>
      ))}
    </div>
  )
}