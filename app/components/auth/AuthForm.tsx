
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
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
    { regex: /.{8,}/, text: "At least 8 characters long" },
    { regex: /[0-9]/, text: "Contains a number" },
    { regex: /[A-Z]/, text: "Contains an uppercase letter" },
    { regex: /[a-z]/, text: "Contains a lowercase letter" },
    { regex: /[^A-Za-z0-9]/, text: "Contains a special character" },
  ];

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Create Account" : "Login"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

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
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {isRegister && password && (
            <div className="mt-2 text-xs text-gray-400">
              <p>Password must:</p>
              <ul className="list-disc list-inside">
                {passwordRequirements.map((req, index) => (
                  <li key={index} className={req.regex.test(password) ? "text-green-400" : "text-red-400"}>
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {!isRegister && (
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
                Remember me
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-blue-500 hover:underline">
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </div>

        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-2">Or {isRegister ? "register" : "login"} with</p>
          <button
            type="button"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
            onClick={() => signIn("google")} // Placeholder for Google Sign-in
          >
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </button>
          </div>
          {/* Add more social login buttons as needed */}
      </form>
    </div>
  );
}
