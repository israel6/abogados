import { PageShell } from '@components/layout/PageShell'
import { PageHero } from '@components/layout/PageHero'
import { LawyerList } from '@components/LawyerList'
import '../styles/lawyers.css'

export function Lawyers() {
  return (
    <PageShell>
      <PageHero
        index="01"
        eyebrow="Nuestro Equipo"
        title="Abogados especializados"
        subtitle="Profesionales con trayectoria comprobada en las principales áreas del derecho ecuatoriano."
      />
      <div className="page-content">
        <LawyerList />
      </div>
    </PageShell>
  )
}
