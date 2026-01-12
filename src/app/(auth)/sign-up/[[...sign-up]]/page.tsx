import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <SignUp
          afterSignUpUrl="/chat"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg",
              card: "bg-white dark:bg-gray-800 shadow-lg rounded-lg",
            },
          }}
        />
      </div>
    </div>
  );
}
