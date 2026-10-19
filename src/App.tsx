import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RequireSession } from './components/RequireSession'
import { AccountSettings } from './pages/AccountSettings'
import { AuthorPage } from './pages/AuthorPage'
import { CollectionPage } from './pages/CollectionPage'
import { Explore } from './pages/Explore'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { MyCollections } from './pages/MyCollections'
import { MyPoems } from './pages/MyPoems'
import { NewPassword } from './pages/NewPassword'
import { NotFound } from './pages/NotFound'
import { PoemPage } from './pages/PoemPage'
import { PrivacySettings } from './pages/PrivacySettings'
import { ProfileSettings } from './pages/ProfileSettings'
import { Recover } from './pages/Recover'
import { SignIn } from './pages/SignIn'
import { SupportSettings } from './pages/SupportSettings'
import { TagPage } from './pages/TagPage'
import { Write } from './pages/Write'

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
        <Route path="/colecciones" element={priv('Mis colecciones', <MyCollections />)} />
        <Route path="/mis/colecciones" element={priv('Mis colecciones', <MyCollections />)} />
        <Route path="/mis/poemas" element={priv('Mis poemas', <MyPoems status="published" />)} />
        <Route path="/mis/borradores" element={priv('Mis borradores', <MyPoems status="draft" />)} />
        <Route path="/mis/biblioteca" element={priv('Mi biblioteca', <Library />)} />
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
