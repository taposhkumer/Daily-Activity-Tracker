import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#d90429] to-[#ff0440]">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
