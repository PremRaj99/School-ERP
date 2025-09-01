import React from "react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function layout({ children }: LayoutProps) {
  return <div>
    {children}
    </div>;
}
