"use client";
import React from "react";
import { ModeToggle } from "../mode-toggle";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import UserService from "@/services/user";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/redux/feature/userSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Header() {
  const { user } = useSelector((state: { user: any }) => state);

  const dispatch = useDispatch();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: UserService.logout,
    onSuccess: async (data) => {
      if (data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh-token");
        dispatch(logout());
        router.push("/login");
      }
    },
    onError: (err) => {
      toast.error("Logout Failed");
    },
  });

  const onSubmit = () => {
    mutation.mutate();
  };

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

          {user.username ? (
            <Button
              title={user.username}
              onClick={onSubmit}
              variant={"destructive"}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant={"destructive"}
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
