export default function HomeSeparator() {
  return (
    <div
      aria-hidden="true"
      className="relative z-20 h-[2px] w-full bg-gradient-to-r from-transparent via-[#899DFF]/20 to-transparent"
    >
      <div className="absolute inset-y-0 left-1/2 w-28 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#FFD400]/15 to-transparent" />
    </div>
  );
}
