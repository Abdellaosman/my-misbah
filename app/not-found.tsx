import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-serif italic text-[#B8860B] text-lg mb-4">
        Turn. Trust. Transform.
      </p>
      <h1 className="font-serif text-4xl text-[#1B2B4B] font-bold mb-4">
        Page Not Found
      </h1>
      <p className="text-[#6b6878] text-base max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist. Let us guide you back.
      </p>
      <Link
        href="/"
        className="bg-[#1B2B4B] hover:bg-[#2d4270] text-white font-medium px-8 py-3 rounded-xl transition-colors text-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
