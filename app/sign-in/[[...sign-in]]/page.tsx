import { SignIn } from "@clerk/nextjs";

type Props = {
  searchParams: Promise<{
    redirect_url?: string;
  }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn forceRedirectUrl={params.redirect_url || "/"} />
    </div>
  );
}
