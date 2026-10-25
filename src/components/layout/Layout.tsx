import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LoadState } from '../LoadState'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Footer } from './Footer'

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-blanco focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Header />
      <main
        id="contenido"
        className="mx-auto w-full max-w-ancho flex-1 px-6 pb-28 pt-10 md:px-10 md:pb-20 md:pt-16"
      >
        <Suspense fallback={<LoadState loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
