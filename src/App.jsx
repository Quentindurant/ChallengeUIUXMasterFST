import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import Recherche from './pages/Recherche.jsx'
import ReservationLayout from './pages/reservation/ReservationLayout.jsx'
import Salle from './pages/reservation/Salle.jsx'
import Materiel from './pages/reservation/Materiel.jsx'
import Vous from './pages/reservation/Vous.jsx'
import Evenement from './pages/reservation/Evenement.jsx'
import Pieces from './pages/reservation/Pieces.jsx'
import Envoi from './pages/reservation/Envoi.jsx'
import Confirmation from './pages/Confirmation.jsx'
import Suivi from './pages/Suivi.jsx'
import AdminDemandes from './pages/admin/AdminDemandes.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminPlanning from './pages/admin/AdminPlanning.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Accueil />} />
        <Route path="recherche" element={<Recherche />} />
        <Route path="reservation" element={<ReservationLayout />}>
          <Route path="salle" element={<Salle />} />
          <Route path="materiel" element={<Materiel />} />
          <Route path="vous" element={<Vous />} />
          <Route path="evenement" element={<Evenement />} />
          <Route path="pieces" element={<Pieces />} />
          <Route path="envoi" element={<Envoi />} />
        </Route>
        <Route path="confirmation" element={<Confirmation />} />
        <Route path="mes-demandes" element={<Suivi />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDemandes />} />
          <Route path="planning" element={<AdminPlanning />} />
        </Route>
      </Route>
    </Routes>
  )
}
