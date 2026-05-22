import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#d90429] to-[#ff0440]">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
