export function BeatIndicator({ beatInBar, beatsPerBar }: { beatInBar: number; beatsPerBar: number }) {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      {Array.from({ length: beatsPerBar }, (_, index) => {
        const active = index === beatInBar
        const downbeat = index === 0
        return (
          <span
            key={index}
            className={`h-3 w-3 rounded-full transition-[background-color,transform] duration-75 ${
              active
                ? downbeat
                  ? "scale-150 bg-orange-400"
                  : "scale-125 bg-orange-500"
                : "bg-gray-700"
            }`}
          />
        )
      })}
    </div>
  )
}
