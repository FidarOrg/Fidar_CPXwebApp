import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { fidar } from "@/lib/fidar";
import { isFidarException } from "fidar-web-sdk";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fidar.getMyProfile();
        setProfile(data); 
      } catch (err) {
        console.error("[Profile Error]", err);

        if (isFidarException(err)) {
          console.error("Fidar error:", err.payload);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="ml-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center min-h-dvh bg-gradient-to-br from-background to-muted px-3 sm:px-4">
      <Card className="w-full max-w-5xl p-8 shadow-xl border-2 border-slate-300 dark:border-slate-700 rounded-2xl">

        {/* Top Header Section */}
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-4">

              <Avatar className="h-20 w-20">
                <AvatarImage src={""} />
                <AvatarFallback>
                  {profile.name?.split(" ")[0]?.[0]}
                  {profile.name?.split(" ")[1]?.[0]}
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-2xl">
                  {profile.name}
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>

            <Button className="passkey-btn">Edit</Button>
          </div>
        </CardHeader>

        <Separator className="my-4" />

        {/* Form Section */}
        <CardContent className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="text-base border rounded-md px-3 py-2 mt-1">
                {profile.name}
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-base border rounded-md px-3 py-2 mt-1">
                {profile.email}
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Username</Label>
              <p className="text-base border rounded-md px-3 py-2 mt-1">
                {profile["user-name"] || "N/A"}
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">User ID</Label>
              <p className="text-base border rounded-md px-3 py-2 mt-1">
                {profile["user-id"]}
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Joined</Label>
              <p className="text-base border rounded-md px-3 py-2 mt-1">
                N/A {/* API does not give createdAt */}
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <p className="text-base border rounded-md px-3 py-2 mt-1">
                Active
              </p>
            </div>

          </div>

          <Button className="passkey-btn w-full md:w-auto">Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
