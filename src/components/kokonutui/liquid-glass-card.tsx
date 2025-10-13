"use client";

/**
 * @author: @dorian_baffier
 * @description: Liquid Glass Card
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

const liquidbuttonVariants = cva(
    "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "bg-transparent hover:scale-105 duration-300 transition text-primary",
                destructive:
                    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 text-xs gap-1.5 px-4 has-[>svg]:px-4",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                xl: "h-12 rounded-md px-8 has-[>svg]:px-6",
                xxl: "h-14 rounded-md px-10 has-[>svg]:px-8",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "xxl",
        },
    }
);

interface LiquidButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
    asChild?: boolean;
}

function ButtonGlassFilter() {
    const filterId = React.useId();
    return (
        <svg className="hidden">
            <title>Glass Effect Filter</title>
            <defs>
                <filter
                    id={filterId}
                    x="0%"
                    y="0%"
                    width="100%"
                    height="100%"
                    colorInterpolationFilters="sRGB"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05 0.05"
                        numOctaves="1"
                        seed="1"
                        result="turbulence"
                    />
                    <feGaussianBlur
                        in="turbulence"
                        stdDeviation="2"
                        result="blurredNoise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="blurredNoise"
                        scale="70"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        result="displaced"
                    />
                    <feGaussianBlur
                        in="displaced"
                        stdDeviation="4"
                        result="finalBlur"
                    />
                    <feComposite
                        in="finalBlur"
                        in2="finalBlur"
                        operator="over"
                    />
                </filter>
            </defs>
        </svg>
    );
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
    (
        { className, variant, size, asChild = false, children, ...props },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        const filterId = React.useId();

        return (
            <>
                <Comp
                    data-slot="button"
                    className={cn(
                        "relative",
                        liquidbuttonVariants({ variant, size, className })
                    )}
                    ref={ref}
                    {...props}
                >
                    <div
                        className="absolute top-0 left-0 z-0 h-full w-full rounded-full 
              shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] 
          transition-all 
          dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"
                    />
                    <div
                        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md"
                        style={{ backdropFilter: `url("#${filterId}")` }}
                    />

                    <div className="pointer-events-none z-10">{children}</div>
                    <ButtonGlassFilter />
                </Comp>
            </>
        );
    }
);

LiquidButton.displayName = "LiquidButton";

const cardVariants = cva(
    "relative overflow-hidden rounded-lg transition-all duration-300 group bg-background/20",
    {
        variants: {
            variant: {
                default:
                    "hover:scale-[1.01] text-foreground backdrop-blur-[2px]",
                primary:
                    "bg-primary/5 hover:bg-primary/5 text-foreground backdrop-blur-[2px]",
                destructive:
                    "bg-destructive/5 hover:bg-destructive/10 text-foreground backdrop-blur-[2px]",
                secondary:
                    "bg-secondary/5 hover:bg-secondary/10 text-foreground backdrop-blur-[2px]",
            },
            size: {
                default: "p-6",
                sm: "p-4",
                lg: "p-8",
                xl: "p-10",
            },
            hover: {
                default: "hover:scale-[1.02]",
                none: "",
                glow: "hover:shadow-lg hover:shadow-primary/20",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            hover: "default",
        },
    }
);

export interface LiquidGlassCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
    asChild?: boolean;
    glassEffect?: boolean;
    showShineBorder?: boolean;
}

function GlassFilter() {
    const filterId = React.useId();

    return (
        <svg className="hidden">
            <title>Glass Effect Filter</title>
            <defs>
                <filter
                    id={filterId}
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    colorInterpolationFilters="sRGB"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05 0.05"
                        numOctaves="1"
                        seed="1"
                        result="turbulence"
                    />
                    <feGaussianBlur
                        in="turbulence"
                        stdDeviation="2"
                        result="blurredNoise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="blurredNoise"
                        scale="30"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        result="displaced"
                    />
                    <feGaussianBlur
                        in="displaced"
                        stdDeviation="4"
                        result="finalBlur"
                    />
                    <feComposite
                        in="finalBlur"
                        in2="finalBlur"
                        operator="over"
                    />
                </filter>
            </defs>
        </svg>
    );
}

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export function CardHeader({
    title,
    subtitle,
    icon,
    className,
    ...props
}: CardHeaderProps) {
    return (
        <div
            className={cn("flex items-start justify-between gap-4", className)}
            {...props}
        >
            <div className="space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight text-foreground">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-sm text-muted-foreground/80">
                        {subtitle}
                    </p>
                )}
            </div>
            {icon && <div className="text-muted-foreground/70">{icon}</div>}
        </div>
    );
}

// Card Content Component
export function CardContent({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("pt-6 text-foreground", className)} {...props} />;
}

const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
    (
        {
            className,
            variant,
            size,
            hover,
            asChild = false,
            showShineBorder = true,
            glassEffect = true,
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "div";
        const filterId = React.useId();

        return (
            <>
                <Comp
                    ref={ref}
                    className={cn(
                        "relative",
                        cardVariants({ variant, size, hover, className })
                    )}
                    {...props}
                >
                    {/* Shine Border */}
                    {showShineBorder && (
                        <ShineBorder
                            borderWidth={0.8}
                            duration={10}
                            shineColor={[
                                "#E84912",
                                "#F6A100",
                                "#53B36A",
                                "#3669B2",
                                "#719AD1"
                            ]}
                            className="absolute inset-0 z-30 rounded-lg pointer-events-none"
                            style={{ borderRadius: "inherit" }}
                        />
                    )}

                    {/* Glass effect overlay */}
                    <div
                        className="absolute inset-0 z-0 h-full w-full rounded-lg
                        shadow-[0_0_8px_rgba(220,220,220,0.12),0_2px_8px_rgba(220,220,220,0.18),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.25),inset_-3px_-3px_0.5px_-3px_rgba(255,255,255,0.18),inset_1px_1px_1px_-0.5px_rgba(220,220,220,0.18),inset_-1px_-1px_1px_-0.5px_rgba(220,220,220,0.18),inset_0_0_6px_6px_rgba(255,255,255,0.10),inset_0_0_2px_2px_rgba(220,220,220,0.08),0_0_12px_rgba(255,255,255,0.10)]
                        transition-all
                        pointer-events-none
                        dark:shadow-[0_0_8px_rgba(220,220,220,0.10),0_2px_8px_rgba(220,220,220,0.14),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.12),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.12),inset_1px_1px_1px_-0.5px_rgba(220,220,220,0.12),inset_-1px_-1px_1px_-0.5px_rgba(220,220,220,0.12),inset_0_0_6px_6px_rgba(255,255,255,0.08),inset_0_0_2px_2px_rgba(220,220,220,0.06),0_0_12px_rgba(255,255,255,0.08)]"
                    />

                    {/* Glass filter effect */}
                    {glassEffect && (
                        <div
                            className="absolute inset-0 -z-10 h-full w-full overflow-hidden rounded-lg"
                            style={{ backdropFilter: `url("#${filterId}")` }}
                        />
                    )}

                    {/* Content */}
                    <div className="relative z-10">{children}</div>

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 z-20 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />

                    {glassEffect && <GlassFilter />}
                </Comp>
            </>
        );
    }
);

export default LiquidGlassCard;