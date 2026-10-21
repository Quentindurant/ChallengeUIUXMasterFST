import { Outlet } from 'react-router'
import Stepper from '../../components/Stepper.jsx'

export default function ReservationLayout() {
  return (
    <>
      <Stepper />
      <Outlet />
    </>
  )
}
