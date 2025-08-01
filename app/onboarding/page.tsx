import { redirect } from "next/navigation";
import { OnboardingStepper } from "@/components/ui/onboarding-stepper";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome to TweakerLab</h1>
          <p className="text-muted-foreground mt-2">
            Let's get your system information to provide personalized
            optimization recommendations.
          </p>
        </div>

        <OnboardingStepper />
      </div>
    </div>
  );
}
