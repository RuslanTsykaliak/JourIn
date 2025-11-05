
"use client";

import { Suspense } from "react";
import AuthForm from "../auth/components/AuthForm";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
