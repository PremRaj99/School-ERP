import React from "react";
import { ModeToggle } from "../mode-toggle";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-black">
      <div className="container mx-auto py-4 flex justify-between items-center shadow-md">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-white text-2xl font-semibold">SchoolERP</span>
        </div>
        {/* Logout and Dark Mode icon */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle Icon */}
          <ModeToggle />
          {/* Logout Button */}
          <Button
            variant={"destructive"}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
