"use client";

export default function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-[#212121]/80 backdrop-blur-[4px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative mx-4 mb-4 w-full max-w-[398px] rounded-[var(--sheet-border-radius,32px)] bg-[var(--surface-base,white)] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-[120%]"
        }`}
      >
        <div className="flex flex-col gap-[var(--sheet-gap,16px)] p-[var(--sheet-padding,24px)] pb-[max(var(--sheet-padding,24px),env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
