"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { Loader2, LogOut, UserCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { type User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import AdminDashboard from "../admin/admin-dashboard/page";
import StudentDashboard from "../student/studentDashboard/page";

interface DashboardClientProps {
  user: User;
  initialRole: string;
}

export default function DashboardClient({
  user,
  initialRole,
}: DashboardClientProps) {
  const [signingOut, setSigningOut] = useState(false);
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      queryClient.removeQueries();
      queryClient.clear();
      if (typeof window !== "undefined") {
        localStorage.removeItem("ui-storage");
        sessionStorage.clear();
      }
      await supabase.auth.signOut();
      window.location.href = "/auth";
    } catch (error: any) {
      alert("Error: " + error.message);
      setSigningOut(false);
    }
  };

  const handleGoToProfile = () => {
    window.dispatchEvent(new CustomEvent("changeTab", { detail: "perfil" }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">
                Asistente Virtual
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {initialRole !== "ADMINISTRADOR" && (
                <button
                  onClick={() =>
                    window.open("https://youtu.be/0MnMoquT22I", "_blank")
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-background/10 hover:bg-background/20 transition-colors"
                  title="Ver Manual"
                >
                  <span className="hidden sm:inline">📘 Ver manual</span>
                </button>
              )}

              <button
                onClick={handleGoToProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-background/10 hover:bg-background/20 transition-colors"
                title="Ir a Perfil"
              >
                <UserCircle className="h-4 w-4 hidden sm:block" />
                <span className="capitalize">{initialRole?.toLowerCase()}</span>
              </button>
              <ModeToggle />
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-background/20 transition-colors"
              >
                {signingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {initialRole === "ADMINISTRADOR" ? (
          <AdminDashboard user={user} />
        ) : (
          <StudentDashboard user={user} />
        )}
      </main>
    </div>
  );
}
