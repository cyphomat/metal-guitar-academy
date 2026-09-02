import { DrillLibrary } from "@/components/session/drill-library"

export const metadata = { title: "Drills · Metal Guitar Academy" }

export default function DrillsPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-white">Drills</h1>
          <p className="mt-2 text-gray-400">
            Alles, was die Session ziehen kann. Einzeln üben, wenn du weisst, was du brauchst —
            sonst nimm einfach die Session, die sucht selbst aus.
          </p>
        </header>
        <DrillLibrary />
      </div>
    </div>
  )
}
