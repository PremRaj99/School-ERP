"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, GraduationCap, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import AuthService from "@/services/auth";
import UserService from "@/services/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@repo/types";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import z from "zod";
import { useDispatch } from "react-redux";
import { login } from "@/redux/feature/userSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(LoginSchema) });

  const mutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: async (data) => {
      if (data.success) {
        localStorage.setItem("token", data.data.accessToken);
        localStorage.setItem("refresh-token", data.data.refreshToken);
        // call the UserService.user
        const user = await UserService.user();
        dispatch(login(user.data));
        if (user.data.role === "Student") {
            router.push("/student");
        }
        if (user.data.role === "Teacher") {
            router.push("/teacher");
        }
        if (user.data.role === "Admin") {
            router.push("/admin");
        }
      }
    },
    onError: (err) => {
      toast.error("Login Failed");
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">EduPortal</h1>
          <p className="text-muted-foreground">
            Sign in to your student account
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {(errors.password?.message ||
                errors.username?.message ||
                errors.root?.message) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.password?.message ||
                      errors.username?.message ||
                      errors.root?.message}
                  </AlertDescription>
                </Alert>
              )}
              {mutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Something went wrong</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  placeholder="Enter your username"
                  {...register("username")}
                  className="bg-input border-border focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="bg-input border-border focus:ring-ring"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="text-accent hover:text-accent/80 text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-accent hover:text-accent/80 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-accent hover:text-accent/80 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
