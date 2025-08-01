import Link from "next/link"
import { RegisterForm } from "@/components/forms/register-form"
import { AnimatedWrapper } from "@/components/ui/animated-wrapper"
import { fadeInUp } from "@/lib/animations"

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <AnimatedWrapper variants={fadeInUp} className="w-full max-w-md space-y-6">
        <RegisterForm />
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </AnimatedWrapper>
    </div>
  )
}
