import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 active:scale-95";

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-accent to-accent-dark text-white hover:shadow-strong hover:-translate-y-0.5 shadow-medium",
    secondary:
      "bg-gradient-to-r from-teal to-teal-dark text-white hover:shadow-strong hover:-translate-y-0.5 shadow-medium",
    danger:
      "bg-gradient-to-r from-rose to-red-600 text-white hover:shadow-strong hover:-translate-y-0.5 shadow-medium",
    success:
      "bg-gradient-to-r from-emerald to-green-600 text-white hover:shadow-strong hover:-translate-y-0.5 shadow-medium",
    outline:
      "border-2 border-accent text-accent hover:bg-accent hover:text-white hover:shadow-medium hover:-translate-y-0.5",
    ghost: "bg-transparent text-muted hover:bg-secondary hover:text-primary",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">Chargement...</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default React.memo(Button);
