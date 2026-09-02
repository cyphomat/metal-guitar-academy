import { DataManager } from "@/components/session/data-manager"

export const metadata = { title: "Daten · Metal Guitar Academy" }

export default function DatenPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 pb-16">
      <header className="mt-6">
        <span className="kicker">Sicherung</span>
        <h1 className="display mt-1 text-[38px] text-fg">Daten</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Dein Übungs-Log liegt nur in diesem Browser. Kein Konto, kein Server — aber auch
          kein Netz, das ihn auffängt. Hier holst du ihn raus und wieder rein.
        </p>
      </header>
      <DataManager />
    </div>
  )
}
