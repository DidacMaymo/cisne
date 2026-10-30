import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { parseMarkdown, type Inline } from '../../lib/markdown'

function inline(nodes: Inline[]): ReactNode[] {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text':
        return n.text
      case 'br':
        return <br key={i} />
      case 'em':
        return <em key={i}>{inline(n.children)}</em>
      case 'strong':
        return <strong key={i}>{inline(n.children)}</strong>
      case 'link': {
        const cls = 'underline underline-offset-4 hover:text-tinta'
        if (n.href.startsWith('/'))
          return (
            <Link key={i} to={n.href} className={cls}>
              {inline(n.children)}
            </Link>
          )
        const external = /^https?:/i.test(n.href)
        return (
          <a key={i} href={n.href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {inline(n.children)}
          </a>
        )
      }
    }
  })
}

/** Renderiza Markdown como elementos React (nunca inyecta HTML del fichero). */
export function Markdown({ source }: { source: string }) {
  return (
    <div className="space-y-5 font-serif text-xl leading-relaxed break-words">
      {parseMarkdown(source).map((b, i) => {
        switch (b.t) {
          case 'h2':
            return (
              <h2 key={i} className="!mt-12 text-3xl italic">
                {inline(b.children)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="!mt-8 text-2xl">
                {inline(b.children)}
              </h3>
            )
          case 'quote':
            return (
              <blockquote key={i} className="border-l border-linea pl-5 italic text-tinta/80">
                {inline(b.children)}
              </blockquote>
            )
          case 'ul':
            return (
              <ul key={i} className="list-disc space-y-2 pl-6">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="list-decimal space-y-2 pl-6">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ol>
            )
          default:
            return <p key={i}>{inline(b.children)}</p>
        }
      })}
    </div>
  )
}
