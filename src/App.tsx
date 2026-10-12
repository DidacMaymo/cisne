import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthorPage } from './pages/AuthorPage'
import { Home } from './pages/Home'
import { MyPoems } from './pages/MyPoems'
import { PoemPage } from './pages/PoemPage'
import { TagPage } from './pages/TagPage'
import { Write } from './pages/Write'
import { NotFound } from './pages/NotFound'
import { Soon } from './pages/Soon'

// Las rutas de las fases siguientes existen ya, con una página sobria, para que
// la navegación nunca lleve a un callejón sin salida.
const soon: ReadonlyArray<[path: string, title: string]> = [
  ['/explorar', 'Explorar'],
  ['/coleccion/:id', 'Colección'],
  ['/colecciones', 'Colecciones'],
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
        <Route path="/escribir" element={<Write />} />
        <Route path="/escribir/:id" element={<Write />} />
        <Route path="/mis/poemas" element={<MyPoems status="published" />} />
        <Route path="/mis/borradores" element={<MyPoems status="draft" />} />
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
