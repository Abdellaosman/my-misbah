import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ConfirmationStatus from "@/components/booking/ConfirmationStatus";

export const metadata = {
  title: "Booking Confirmation — My Misbah",
};

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ appointment?: string }>;
}) {
  const { appointment: publicId } = await searchParams;

  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      <div className="bg-[#1A2B50] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/book" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors">
            <ArrowLeft size={15} />
            Back to Booking
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {publicId ? (
          <ConfirmationStatus publicId={publicId} />
        ) : (
          <div className="bg-white rounded-2xl border border-[#EAE3D4] p-8 text-center">
            <p className="text-[#1A2B50] font-semibold mb-1">No booking reference provided</p>
            <p className="text-sm text-[#6b6878] mb-4">
              If you just completed a payment, check your email for confirmation details.
            </p>
            <Link href="/book" className="text-sm text-[#C8680A] font-medium hover:underline">
              Return to booking
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
