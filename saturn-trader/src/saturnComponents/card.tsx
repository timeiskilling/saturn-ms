import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface BasicCardProps extends Omit<
  React.ComponentProps<typeof Card>,
  "title"
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    content?: string;
    footer?: string;
  };
}

export function BasicCard({
  title,
  description,
  footer,
  children,
  classNames,
  className,
  ...props
}: BasicCardProps) {
  return (
    <Card className={cn("w-full", className)} {...props}>
      {(title || description) && (
        <CardHeader className={classNames?.header}>
          {title && (
            <CardTitle className={classNames?.title}>{title}</CardTitle>
          )}
          {description && (
            <CardDescription className={classNames?.description}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      {/* Content Skeleton */}
      {children && (
        <CardContent className={classNames?.content}>{children}</CardContent>
      )}

      {/* Footer Skeleton */}
      {footer && (
        <CardFooter className={classNames?.footer}>{footer}</CardFooter>
      )}
    </Card>
  );
}
