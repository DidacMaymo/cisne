import { lazy } from 'react'
import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RequireSession } from './components/RequireSession'
import { AuthorPage } from './pages/AuthorPage'
import { CollectionPage } from './pages/CollectionPage'
import { Explore } from './pages/Explore'
import { Home } from './pages/Home'
import { MyPageRedirect } from './pages/MyPageRedirect'
import { NotFound } from './pages/NotFound'
import { PoemPage } from './pages/PoemPage'
import { TagPage } from './pages/TagPage'

// Lectura: en el chunk inicial. Editor, ajustes y cuenta: se descargan al entrar.
const AccountSettings = lazy(() => import('./pages/AccountSettings').then((m) => ({ default: m.AccountSettings })))
const NewPassword = lazy(() => import('./pages/NewPassword').then((m) => ({ default: m.NewPassword })))
const PrivacySettings = lazy(() => import('./pages/PrivacySettings').then((m) => ({ default: m.PrivacySettings })))
const ProfileSettings = lazy(() => import('./pages/ProfileSettings').then((m) => ({ default: m.ProfileSettings })))
const Recover = lazy(() => import('./pages/Recover').then((m) => ({ default: m.Recover })))
const SignIn = lazy(() => import('./pages/SignIn').then((m) => ({ default: m.SignIn })))
const SupportSettings = lazy(() => import('./pages/SupportSettings').then((m) => ({ default: m.SupportSettings })))
const Write = lazy(() => import('./pages/Write').then((m) => ({ default: m.Write })))

const priv = (title: string, page: ReactNode) => <RequireSession title={title}>{page}</RequireSession>

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/poema/:id" element={<PoemPage />} />
        <Route path="/escribir" element={<Write />} />
        <Route path="/escribir/:id" element={priv('Editar poema', <Write />)} />
        <Route path="/etiqueta/:tag" element={<TagPage />} />
        <Route path="/autor/:accountName" element={<AuthorPage />} />
        <Route path="/coleccion/:id" element={<CollectionPage />} />
        <Route path="/mi-pagina" element={<MyPageRedirect />} />
        <Route path="/colecciones" element={<MyPageRedirect ver="colecciones" />} />
        <Route path="/mis/colecciones" element={<MyPageRedirect ver="colecciones" />} />
        <Route path="/mis/poemas" element={<MyPageRedirect ver="publicados" />} />
        <Route path="/mis/borradores" element={<MyPageRedirect ver="borradores" />} />
        <Route path="/mis/biblioteca" element={<MyPageRedirect ver="biblioteca" />} />
        <Route path="/ajustes/perfil" element={priv('Perfil', <ProfileSettings />)} />
        <Route path="/ajustes/cuenta" element={priv('Cuenta', <AccountSettings />)} />
        <Route path="/ajustes/privacidad" element={priv('Privacidad', <PrivacySettings />)} />
        <Route path="/ajustes/apoyos" element={priv('Apoyos', <SupportSettings />)} />
        <Route path="/entrar" element={<SignIn key="entrar" mode="entrar" />} />
        <Route path="/registro" element={<SignIn key="registro" mode="registro" />} />
        <Route path="/recuperar" element={<Recover />} />
        <Route path="/nueva-contrasena" element={<NewPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
