"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An unknown error occurred.";

  // You can customize error messages based on the 'error' query parameter
  switch (error) {
    case "OAuthAccountNotLinked":
      errorMessage = "This email is already linked to another account. Please sign in with the original provider.";
      break;
    case "CredentialsSignin":
      errorMessage = "Invalid email or password. Please try again.";
      break;
    case "EmailSignin":
      errorMessage = "Email could not be sent. Please try again later.";
      break;
    case "Callback":
      errorMessage = "An error occurred during the callback. Please try again.";
      break;
    case "Verification":
      errorMessage = "The verification link is invalid or has expired.";
      break;
    default:
      errorMessage = "An unexpected error occurred. Please try again.";
      break;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Authentication Error</h2>
        <p className="text-gray-300 mb-6">{errorMessage}</p>
        <Link href="/auth" className="text-blue-500 hover:underline">
          Go back to login
        </Link>
      </div>
    </div>
  );
}
