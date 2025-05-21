export function DefaultHydrateFallback() {
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <div className="skeleton h-32 w-full"></div>
    </div>
  );
}
