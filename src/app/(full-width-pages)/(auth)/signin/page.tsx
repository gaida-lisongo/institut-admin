import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default function SignIn() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
      <LoginForm />
    </div>
  );
}
