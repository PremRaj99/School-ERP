import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

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
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <div className="flex flex-col w-md max-w-full p-4 gap-2">
        <Label htmlFor="username">Username</Label>
        <Input placeholder="Username" disabled />
        <Label htmlFor="oldPassword">Old Password</Label>
        <Input  placeholder="Current Password" name="oldPassword" />
        <Label htmlFor="newPassword">New Password</Label>
        <Input  placeholder="New Password" name="newPassword" />
        <Button>Change Password</Button>
      </div>
    </div>
  );
}
