import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error404() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold">404 Not Found</h1>
        <p className="text-lg text-muted-foreground max-w-md text-center">
          Halaman yang Anda cari tidak ditemukan.
          <br />
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link to="/home">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
