import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight, Sparkles } from "lucide-react";

export function LoginPage() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await signIn(email, password);
      toast.success("Successfully logged in!");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleDemoLogin = async () => {
    setEmail("demo@kontenflow.com");
    setPassword("password");
    
    try {
      await signIn("demo@kontenflow.com", "password");
      toast.success("Demo login successful!");
    } catch (error) {
      toast.error("Demo login failed. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Simple floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        
        {/* Left Side - Simple Hero */}
        <motion.div 
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="space-y-6">
            <motion.div
              className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Content Management Platform</span>
            </motion.div>
            
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KontenFlow
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Streamline your content creation process with powerful tools for planning, scheduling, and collaboration.
            </p>
          </div>

          {/* Simple feature highlights */}
          <div className="space-y-4">
            {[
              "📊 Content Analytics & Insights",
              "📅 Smart Scheduling Tools", 
              "👥 Team Collaboration",
              "🚀 Automated Workflows"
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 text-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="text-lg">{feature}</span>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="flex items-center space-x-4 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-sm ${
                    i === 1 ? 'bg-blue-500' :
                    i === 2 ? 'bg-purple-500' :
                    i === 3 ? 'bg-green-500' :
                    'bg-orange-500'
                  }`}
                />
              ))}
            </div>
            <span>Trusted by 25,000+ content creators</span>
          </motion.div>
        </motion.div>

        {/* Right Side - Simple Login Form */}
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <motion.div 
                className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to continue to KontenFlow
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Demo Login Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleDemoLogin}
                  variant="outline"
                  className="w-full h-12 text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 font-medium"
                  disabled={isLoading}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Try Demo Login
                </Button>
              </motion.div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">or sign in with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Demo Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
                    Demo
                  </Badge>
                  <span className="text-sm font-medium text-blue-900">Quick Access</span>
                </div>
                <p className="text-sm text-blue-700">
                  Use any email and password to explore the demo, or click "Try Demo Login" for instant access.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Hero */}
          <motion.div 
            className="lg:hidden mt-8 text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Content Management
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Streamline your content creation process with powerful and intuitive tools.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
