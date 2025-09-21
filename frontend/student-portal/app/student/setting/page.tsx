"use client";
import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema } from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import UserService from "@/services/user";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function page() {
  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Setting",
    },
  ];
  // Define RootState type according to your Redux store structure
  interface RootState {
    user: {
      username: string;
      role: string;
    };
  }

  const { user } = useSelector((state: RootState) => state);

  type FormData = {
    oldPassword: string;
    newPassword: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(ChangePasswordSchema) });

  const mutation = useMutation({
    mutationFn: UserService.changePassword,
    onSuccess: async (data) => {
      if (data.success) {
        toast.success("Password changed successfully");
      }
    },
    onError: (err) => {
      toast.error("Failed Please try again later");
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-md max-w-full p-4 gap-2"
      >
        <Label htmlFor="username">Username</Label>
        <Input placeholder="Username" value={user.username} disabled />
        <Label htmlFor="oldPassword">Old Password</Label>
        <Input placeholder="Current Password" {...register("oldPassword")} />
        <Label htmlFor="newPassword">New Password</Label>
        <Input placeholder="New Password" {...register("newPassword")} />
        {(errors.newPassword?.message ||
          errors.oldPassword?.message ||
          errors.root?.message) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.newPassword?.message ||
                errors.oldPassword?.message ||
                errors.root?.message}
            </AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing password...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </form>
    </div>
  );
}
