import { privateMetadata } from "@/lib/seo";
import { SignInForm } from "@/components/admin/sign-in-form";

export const metadata = privateMetadata;

export default function AdminAuthPage() {
  return <SignInForm />;
}
