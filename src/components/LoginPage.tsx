import { useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const user = useUser();

  if (user) {
    return null; // User sudah login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>KontenFlow</CardTitle>
          <CardDescription>
            Masuk untuk mengelola konten Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => window.location.href = "/handler/sign-in"}
            className="w-full"
          >
            Masuk
          </Button>
          <Button 
            onClick={() => window.location.href = "/handler/sign-up"}
            variant="outline"
            className="w-full"
          >
            Daftar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
