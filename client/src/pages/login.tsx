import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      console.log("Attempting login with username:", data.username);
      
      // Use direct fetch instead of the apiRequest helper for more control
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", // Important for cookies
      });
      
      // Log the response status
      console.log("Login response status:", response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log("Login successful, user data:", userData);
        
        toast({
          title: "Login successful",
          description: "Welcome back to your YouTube SEO Command Center!",
        });
        
        // Use window.location for a full page refresh to ensure session is recognized
        window.location.href = "/";
      } else {
        let errorMessage = "Invalid username or password";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        
        console.error("Login failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password. If you haven't registered, use 'faisal' as username and 'password123' as password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e1118] p-4">
      <Card className="mx-auto w-full max-w-md bg-[#151827] border-[#1e2231] text-white">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-8">
            <div className="gradient-primary rounded-lg h-12 w-12 flex items-center justify-center">
              <span className="font-bold text-white text-2xl">H</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">YouTube SEO Command Center</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="faisal" 
                        {...field} 
                        className="bg-[#1e2231] border-[#2a3146] text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="password123" 
                        {...field} 
                        className="bg-[#1e2231] border-[#2a3146] text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full gradient-primary" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#2a3146]"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#151827] px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={() => {
                  // Use the replit domain for Google OAuth
                  const replit_domain = window.location.origin;
                  window.location.href = `${replit_domain}/api/auth/google`;
                }}
                className="w-full bg-[#1e2231] hover:bg-[#2a3146] text-white"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with YouTube/Google
                </div>
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-400">
            <p>Demo account: username <span className="text-indigo-400">faisal</span>, password <span className="text-indigo-400">password123</span></p>
          </div>
          <div className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Hamna Tec. All rights reserved.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}