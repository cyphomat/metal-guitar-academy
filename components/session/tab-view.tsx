export function TabView({ tab }: { tab: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-black/50 p-4">
      <pre className="font-mono text-[13px] leading-relaxed text-gray-200 sm:text-sm">{tab}</pre>
    </div>
  )
}
