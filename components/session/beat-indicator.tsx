export function BeatIndicator({ beatInBar, beatsPerBar }: { beatInBar: number; beatsPerBar: number }) {
  return (
    <div className="flex flex-none items-center gap-[6px] px-1" aria-hidden>
      {Array.from({ length: beatsPerBar }, (_, index) => {
        const active = index === beatInBar
        const downbeat = index === 0
        return (
          <span
            key={index}
            className={`h-[10px] w-[10px] border transition-colors duration-75 ${
              active
                ? downbeat
                  ? "border-akzent bg-akzent"
                  : "border-akzent bg-[--tint-akzent-stark]"
                : "border-line bg-sunken"
            }`}
          />
        )
      })}
    </div>
  )
}
