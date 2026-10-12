import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthorPage } from './pages/AuthorPage'
import { Home } from './pages/Home'
import { PoemPage } from './pages/PoemPage'
import { TagPage } from './pages/TagPage'
import { NotFound } from './pages/NotFound'
import { Soon } from './pages/Soon'

// Las rutas de las fases siguientes existen ya, con una página sobria, para que
// la navegación nunca lleve a un callejón sin salida.
const soon: ReadonlyArray<[path: string, title: string]> = [
  ['/explorar', 'Explorar'],
  ['/escribir', 'Escribir un poema'],
  ['/escribir/:id', 'Escribir un poema'],
  ['/coleccion/:id', 'Colección'],
  ['/colecciones', 'Colecciones'],
  ['/mis/poemas', 'Mis poemas'],
  ['/mis/borradores', 'Mis borradores'],
  ['/mis/colecciones', 'Mis colecciones'],
  ['/mis/biblioteca', 'Mi biblioteca'],
  ['/ajustes/perfil', 'Perfil'],
  ['/ajustes/privacidad', 'Privacidad'],
  ['/ajustes/cuenta', 'Cuenta'],
  ['/entrar', 'Entrar'],
  ['/registro', 'Crear cuenta'],
  ['/recuperar', 'Recuperar contraseña'],
]

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/poema/:id" element={<PoemPage />} />
        <Route path="/etiqueta/:tag" element={<TagPage />} />
        <Route path="/autor/:accountName" element={<AuthorPage />} />
        {soon.map(([path, title]) => (
          <Route key={path} path={path} element={<Soon title={title} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
