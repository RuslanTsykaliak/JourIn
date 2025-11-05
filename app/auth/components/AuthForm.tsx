


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
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister
            ? "Create Account"
            : isForgotPassword
              ? "Forgot Password"
              : isResetPassword
                ? "Reset Password"
                : "Login"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}

        {isRegister && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              required={isRegister}
            />
          </div>
        )}

        {!isResetPassword && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="email">
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
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        )}

        {!isForgotPassword && !isResetPassword && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" htmlFor="password">
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
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 pr-10"
                required={!isForgotPassword && !isResetPassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {isRegister && password && (
              <div className="mt-2 text-xs text-gray-400">
                <p>The password must:</p>
                <ul className="list-disc list-inside">
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      className={req.regex.test(password) ? "text-green-400" : "text-red-400"}
                    >
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
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </>
        )}

        {!isRegister && !isForgotPassword && !isResetPassword && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                Remember me on this device
              </label>
            </div>
            <button
              type="button"
              onClick={handleToggleForgotPassword}
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isRegister
            ? "Register"
            : isForgotPassword
              ? "Send Reset Link"
              : isResetPassword
                ? "Reset Password"
                : "Login"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
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
                className="text-blue-500 hover:underline"
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
