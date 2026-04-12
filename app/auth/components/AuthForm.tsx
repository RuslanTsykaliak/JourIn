


"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(!!token);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (token) {
      setIsResetPassword(true);
      setIsRegister(false);
      setIsForgotPassword(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isResetPassword) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setIsResetPassword(false);
      } else {
        setError(data.message || "Something went wrong");
      }
      return;
    }

    if (isForgotPassword) {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || "Something went wrong");
      }
      return;
    }

    if (isRegister) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setIsRegister(false);
        setMessage("Registration successful! Please login.");
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    } else {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    }
  };

  const passwordRequirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[0-9]/, text: "Contain at least one number" },
    { regex: /[A-Z]/, text: "Contain at least one uppercase letter" },
    { regex: /[a-z]/, text: "Contain at least one lowercase letter" },
    { regex: /[^A-Za-z0-9]/, text: "Contain at least one special character" },
  ];

  const handleToggleRegister = () => {
    setIsRegister(!isRegister);
    setIsForgotPassword(false);
    setIsResetPassword(false);
    setError("");
    setMessage("");
  };

  const handleToggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setIsRegister(false);
    setIsResetPassword(false);
    setError("");
    setMessage("");
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-12 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
        <h2 className="text-4xl font-bold mb-10 text-center">
          {isRegister
            ? "Create Account"
            : isForgotPassword
              ? "Forgot Password"
              : isResetPassword
                ? "Reset Password"
                : "Login"}
        </h2>
        {error && <p className="text-red-500 mb-8 text-center text-lg">{error}</p>}
        {message && <p className="text-green-500 mb-8 text-center text-lg">{message}</p>}

        {isRegister && (
          <div className="mb-8">
            <label className="block text-base font-medium mb-4" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-lg"
              required={isRegister}
              placeholder="Enter your full name"
            />
          </div>
        )}

        {!isResetPassword && (
          <div className="mb-8">
            <label className="block text-base font-medium mb-4" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-lg"
              required
              placeholder="your@email.com"
            />
          </div>
        )}

        {!isForgotPassword && !isResetPassword && (
          <div className="mb-8">
            <label className="block text-base font-medium mb-4" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 pr-14 transition-colors text-lg"
                required={!isForgotPassword && !isResetPassword}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            {isRegister && password && (
              <div className="mt-4 p-4 bg-gray-700 rounded-xl">
                <p className="text-sm text-gray-400 mb-3 font-medium">Password requirements:</p>
                <ul className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      className={`text-sm flex items-center ${req.regex.test(password) ? "text-green-400" : "text-red-400"}`}
                    >
                      <span className="mr-3 text-base">{req.regex.test(password) ? "✓" : "○"}</span>
                      {req.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {isResetPassword && (
          <>
            <div className="mb-8">
              <label className="block text-base font-medium mb-4" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-lg"
                required
                placeholder="Enter new password"
              />
            </div>

            <div className="mb-8">
              <label className="block text-base font-medium mb-4" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-lg"
                required
                placeholder="Confirm new password"
              />
            </div>
          </>
        )}

        {!isRegister && !isForgotPassword && !isResetPassword && (
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-3 block text-sm text-gray-300">
                Remember me on this device
              </label>
            </div>
            <button
              type="button"
              onClick={handleToggleForgotPassword}
              className="text-sm text-blue-500 hover:underline transition-colors font-medium"
            >
              Forgot your password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:shadow-outline transition-colors text-lg"
        >
          {isRegister
            ? "Create Account"
            : isForgotPassword
              ? "Send Reset Link"
              : isResetPassword
                ? "Reset Password"
                : "Login"}
        </button>

        <div className="mt-10 text-center">
          <p className="text-base text-gray-400">
            {isRegister
              ? "Do you already have an account?"
              : isForgotPassword
                ? "Remember your password?"
                : isResetPassword
                  ? ""
                  : "Don't have an account yet?"}{" "}
            {!isResetPassword && (
              <button
                type="button"
                onClick={isForgotPassword ? handleToggleForgotPassword : handleToggleRegister}
                className="text-blue-500 hover:underline transition-colors font-semibold text-base"
              >
                {isRegister ? "Login" : isForgotPassword ? "Login" : "Register"}
              </button>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
