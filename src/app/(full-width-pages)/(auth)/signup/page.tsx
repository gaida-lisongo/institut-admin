import MultiStepSignupForm from "@/components/auth/MultiStepSignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | Institut d'Administration",
  description: "Créez votre compte sur la plateforme Institut d'Administration",
};

export default function SignUp() {
  return (
    <div className="lg:w-1/2 w-full h-full flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
      <MultiStepSignupForm />
    </div>
  );
}
