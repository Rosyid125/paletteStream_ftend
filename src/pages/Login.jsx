import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Palette, ArrowRight, Github, Twitter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { login, requestLoginOtp, verifyLoginOtp, resendLoginOtp, loginWithGoogle } from "@/services/authService"; // Import API login dan OTP yang sudah dibuat

export default function LoginPage() {
  const navigate = useNavigate(); // Use useNavigate hook
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const [tab, setTab] = useState("password"); // "password" | "otp"
  const [otpStep, setOtpStep] = useState(1); // 1: input email, 2: input otp
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpErrors, setOtpErrors] = useState({});
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Panggil API login
      const response = await login(formData); // Kirim formData ke fungsi login

      // Jika login berhasil, kita terima token atau data lainnya
      toast({
        title: "Login successful",
        description: "Welcome back to PaletteStream!",
      });

      // Redirect user ke halaman utama setelah login berhasil
      navigate("/home");
    } catch (error) {
      setErrors({
        general: error.response.data.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpErrors({});
    if (!otpEmail) {
      setOtpErrors({ email: "Email is required" });
      setOtpLoading(false);
      return;
    }
    try {
      await requestLoginOtp(otpEmail);
      setOtpStep(2);
      toast({ title: "OTP sent", description: `OTP telah dikirim ke ${otpEmail}` });
      setResendCountdown(30);
    } catch (error) {
      setOtpErrors({ general: error?.response?.data?.message || "Failed to send OTP" });
    } finally {
      setOtpLoading(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpErrors({});
    try {
      await resendLoginOtp(otpEmail);
      toast({ title: "OTP resent", description: `OTP baru telah dikirim ke ${otpEmail}` });
      setResendCountdown(30);
    } catch (error) {
      setOtpErrors({ general: error?.response?.data?.message || "Failed to resend OTP" });
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpErrors({});
    if (!otp) {
      setOtpErrors({ otp: "OTP is required" });
      setOtpLoading(false);
      return;
    }
    try {
      await verifyLoginOtp({ email: otpEmail, otp });
      toast({ title: "Login successful", description: "Welcome back to PaletteStream!" });
      navigate("/home");
    } catch (error) {
      setOtpErrors({ general: error?.response?.data?.message || "OTP login failed" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login error", error);
      toast({ title: "Google login failed", description: error?.response?.data?.message || "Something went wrong with Google login" });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
            <Palette className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to PaletteStream</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>Enter your email and password or login with OTP</CardDescription>
            <div className="flex gap-2 mt-2">
              <Button variant={tab === "password" ? "default" : "outline"} size="sm" onClick={() => setTab("password")}>
                Password
              </Button>
              <Button variant={tab === "otp" ? "default" : "outline"} size="sm" onClick={() => setTab("otp")}>
                OTP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tab === "password" && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.general && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} disabled={isLoading} className={errors.email ? "border-red-500" : ""} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="mx-2 text-xs text-gray-400">or</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2 inline" />
                  Continue with Google
                </Button>
              </>
            )}
            {tab === "otp" && (
              <>
                <div>
                  {otpStep === 1 && (
                    <form onSubmit={handleSendLoginOtp} className="space-y-4">
                      {otpErrors.general && (
                        <Alert variant="destructive">
                          <AlertDescription>{otpErrors.general}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="otpEmail">Email</Label>
                        <Input
                          id="otpEmail"
                          name="otpEmail"
                          type="email"
                          placeholder="name@example.com"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          disabled={otpLoading}
                          className={otpErrors.email ? "border-red-500" : ""}
                        />
                        {otpErrors.email && <p className="text-sm text-red-500">{otpErrors.email}</p>}
                      </div>
                      <Button type="submit" className="w-full" disabled={otpLoading}>
                        {otpLoading ? "Sending OTP..." : "Send OTP"}
                        {!otpLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  )}
                  {otpStep === 2 && (
                    <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                      {otpErrors.general && (
                        <Alert variant="destructive">
                          <AlertDescription>{otpErrors.general}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="otp">OTP</Label>
                        <Input id="otp" name="otp" type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={otpLoading} className={otpErrors.otp ? "border-red-500" : ""} />
                        {otpErrors.otp && <p className="text-sm text-red-500">{otpErrors.otp}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={handleResendOtp} disabled={resendCountdown > 0 || resendLoading}>
                          {resendLoading ? "Resending..." : resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : "Resend OTP"}
                        </Button>
                      </div>
                      <Button type="submit" className="w-full" disabled={otpLoading}>
                        {otpLoading ? "Verifying..." : "Login"}
                        {!otpLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  )}
                </div>
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="mx-2 text-xs text-gray-400">or</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2 inline" />
                  Continue with Google
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                {" "}
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
