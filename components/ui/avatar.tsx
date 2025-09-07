import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: number
}

function Avatar({ src, alt = "", fallback, size = 36, className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const dimension = { width: size, height: size }

  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted text-muted-foreground select-none border border-white/10",
        className
      )}
      style={dimension}
      {...props}
    >
      {src && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-medium">
          {fallback?.slice(0, 2).toUpperCase() || "?"}
        </span>
      )}
    </div>
  )
}

export { Avatar }
