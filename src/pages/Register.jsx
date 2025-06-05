import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Palette, ArrowRight, Github, Twitter, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { requestRegisterOtp, registerWithOtp } from "@/services/authService";

const handleGoogleRegister = () => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  // Pastikan redirect_uri mengarah ke FE /auth/google/callback
  const redirectUri = encodeURIComponent(window.location.origin + "/auth/google/callback");
  window.location.href = `${baseUrl}/auth/login/google?redirect_uri=${redirectUri}`;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true, // Set to true by default, remove checkbox
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: email, 2: otp+data
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Remove handleCheckboxChange as agreeTerms is no longer a checkbox

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      if (!formData.email) {
        setErrors({ email: "Email is required" });
        setIsLoading(false);
        return;
      }
      const res = await requestRegisterOtp(formData.email);
      setOtpSent(true);
      setStep(2);
      toast({ title: "OTP sent", description: `OTP telah dikirim ke ${formData.email}` });
    } catch (error) {
      setErrors({ general: error?.response?.data?.message || "Failed to send OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!otp) {
      newErrors.otp = "OTP is required";
    }
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must include uppercase, lowercase, and numbers";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const { email, firstName, lastName, password } = formData;
      const data = { email, firstName, lastName, password, otp };
      const res = await registerWithOtp(data);
      toast({ title: "Registration successful", description: "Welcome to PaletteStream!" });
      navigate("/home");
    } catch (error) {
      setErrors({ general: error?.response?.data?.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
            <Palette className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Join PaletteStream</h1>
          <p className="text-sm text-muted-foreground">Create an account to start sharing your artwork</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Create an Account</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <>
                <form onSubmit={handleSendOtp} className="space-y-4">
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="mx-2 text-xs text-gray-400">or</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleRegister}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2 inline" />
                  Continue with Google
                </Button>
              </>
            )}
            {step === 2 && (
              <form onSubmit={handleRegister} className="space-y-4">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input id="otp" name="otp" type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={isLoading} className={errors.otp ? "border-red-500" : ""} />
                  {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} disabled={isLoading} className={errors.firstName ? "border-red-500" : ""} />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} disabled={isLoading} className={errors.lastName ? "border-red-500" : ""} />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="ml-1 h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Password must be at least 8 characters and include uppercase, lowercase, and numbers</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
