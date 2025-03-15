// src/app/algorithms/layout.tsx
import { ClientNav } from '@/components/ClientNav';

export default function AlgorithmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-4">
            <ClientNav />
          </div>
        </aside>

        <div className="lg:col-span-9">
          {children}
        </div>
      </div>
    </div>
  )
}