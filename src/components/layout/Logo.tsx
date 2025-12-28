interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const imageSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${imageSizes[size]} rounded-xl overflow-hidden bg-black shadow-lg`}
      >
        <img
          src="https://www.urbanites.in/assets/images/logo.png"
          alt="Assesment Exam Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} font-display font-bold text-gradient-primary`}
          >
            Assesment Exam
          </span>
          {size === "lg" && (
            <span className="text-xs text-muted-foreground font-medium tracking-wide">
              Online Assessment Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}
