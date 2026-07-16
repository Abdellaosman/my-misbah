import { practitionerLogout } from "@/lib/auth/actions";

export default function LogoutButton() {
  return (
    <form action={practitionerLogout}>
      <button
        type="submit"
        className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40"
      >
        Sign out
      </button>
    </form>
  );
}
