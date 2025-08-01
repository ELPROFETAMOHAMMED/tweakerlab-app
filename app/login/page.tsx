import Link from "next/link"
import { LoginForm } from "@/components/forms/login-form"
import { AnimatedWrapper } from "@/components/ui/animated-wrapper"
import { fadeInUp } from "@/lib/animations"

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <AnimatedWrapper variants={fadeInUp} className="w-full max-w-md space-y-6">
        <LoginForm />
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </AnimatedWrapper>
    </div>
  )
}
