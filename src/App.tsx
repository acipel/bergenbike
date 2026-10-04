import { useEffect, useSyncExternalStore } from 'react'
import { HashRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Icon } from './components/Icon'
import { TabBar } from './components/Screen'
import { AlertsScreen } from './screens/AlertsScreen'
import { MyBikeScreen, RegisterScreen } from './screens/BikeScreens'
import { Landing } from './screens/Landing'
import { MapScreen } from './screens/MapScreen'
import { CheckScreen, ReportScreen, ReportStolenScreen } from './screens/ReportScreens'
import { AddSpotScreen, SpotScreen } from './screens/SpotScreens'
import { StoreProvider, ToastProvider } from './store'

const PHONE = '(max-width: 719px), (max-height: 500px) and (pointer: coarse)'

function useIsPhone(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(PHONE)
      query.addEventListener('change', notify)
      return () => query.removeEventListener('change', notify)
    },
    () => window.matchMedia(PHONE).matches,
  )
}

function Home() {
  return useIsPhone() ? <Navigate to="/map" replace /> : <Landing />
}

function AppShell() {
  const phone = useIsPhone()
  const { pathname } = useLocation()

  useEffect(() => {
    document.querySelector('.screen')?.scrollTo(0, 0)
  }, [pathname])

  const shell = (
    <div className="shell">
      <ToastProvider>
        <Outlet />
      </ToastProvider>
      <TabBar />
    </div>
  )
  if (phone) return shell
  return (
    <div className="stage">
      <Link to="/" className="stage-back">
        <Icon name="back" size={18} sw={2.2} />
        About BergenBike
      </Link>
      {shell}
      <p className="stage-note">BergenBike is made for phones. This is a preview of the phone app.</p>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Landing />} />
          <Route element={<AppShell />}>
            <Route path="/map" element={<MapScreen />} />
            <Route path="/spot/:id" element={<SpotScreen />} />
            <Route path="/add" element={<AddSpotScreen />} />
            <Route path="/bike" element={<MyBikeScreen />} />
            <Route path="/bike/edit" element={<RegisterScreen />} />
            <Route path="/report" element={<ReportScreen />} />
            <Route path="/report/stolen" element={<ReportStolenScreen />} />
            <Route path="/check" element={<CheckScreen />} />
            <Route path="/alerts" element={<AlertsScreen />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
