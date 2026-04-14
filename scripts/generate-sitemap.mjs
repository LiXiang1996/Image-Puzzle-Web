import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_SITE_ORIGIN = 'https://image-puzzle-web-skmv.vercel.app'
const DEFAULT_API_BASE_URL = 'https://image-puzzle-server.vercel.app/api'
const PUBLIC_DIR = path.resolve(__dirname, '../public')
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml')
const PAGE_SIZE = 100

const SITE_ORIGIN = normalizeSiteOrigin(process.env.VITE_SITE_ORIGIN || DEFAULT_SITE_ORIGIN)
const API_BASE_URL = normalizeApiBaseUrl(process.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL)

const STATIC_URLS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/discover', changefreq: 'daily', priority: '0.9' },
  { path: '/memories', changefreq: 'daily', priority: '0.8' },
]

async function main() {
  const today = toDateOnly(new Date().toISOString())
  const noteEntries = new Map()
  const userEntries = new Map()

  try {
    const discoverItems = await fetchAllDiscoverNotes()

    for (const note of discoverItems) {
      if (!note?.id) continue

      noteEntries.set(note.id, {
        path: `/note/${note.id}`,
        lastmod: toDateOnly(note.published_at || note.created_at || today),
        changefreq: 'weekly',
        priority: '0.7',
      })

      const authorId = note.author?.id
      if (!authorId) continue

      const lastmod = toDateOnly(note.published_at || note.created_at || today)
      const existing = userEntries.get(authorId)
      if (!existing || existing.lastmod < lastmod) {
        userEntries.set(authorId, {
          path: `/u/${authorId}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.6',
        })
      }
    }

    console.log(
      `[sitemap] collected ${noteEntries.size} public notes and ${userEntries.size} public user pages`,
    )
  } catch (error) {
    console.warn(
      `[sitemap] failed to fetch public content from ${API_BASE_URL}, falling back to static routes only.`,
    )
    console.warn(error instanceof Error ? error.message : String(error))
  }

  const entries = [
    ...STATIC_URLS.map((entry) => ({ ...entry, lastmod: today })),
    ...sortEntriesByPath(noteEntries.values()),
    ...sortEntriesByPath(userEntries.values()),
  ]

  const xml = renderSitemap(entries)

  await mkdir(PUBLIC_DIR, { recursive: true })
  await writeFile(SITEMAP_PATH, xml, 'utf8')
  console.log(`[sitemap] wrote ${entries.length} URLs to ${SITEMAP_PATH}`)
}

async function fetchAllDiscoverNotes() {
  const items = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const data = await fetchDiscoverPage(page, PAGE_SIZE)
    const list = Array.isArray(data?.list) ? data.list : []
    const total = Number(data?.total || 0)
    const pageSize = Number(data?.page_size || PAGE_SIZE)

    items.push(...list)

    totalPages = total > 0 ? Math.ceil(total / pageSize) : page
    if (list.length === 0) break
    page += 1
  }

  return items
}

async function fetchDiscoverPage(page, pageSize) {
  const url = new URL(`${API_BASE_URL.replace(/\/$/, '')}/discover`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('page_size', String(pageSize))

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`discover request failed: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()
  return payload?.data ?? payload
}

function renderSitemap(entries) {
  const body = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}${entry.path}`)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

function normalizeSiteOrigin(value) {
  return value.replace(/\/$/, '')
}

function normalizeApiBaseUrl(value) {
  const normalized = value.replace(/\/$/, '')
  if (/^https?:\/\//.test(normalized)) {
    return normalized
  }
  return DEFAULT_API_BASE_URL
}

function toDateOnly(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }
  return date.toISOString().slice(0, 10)
}

function sortEntriesByPath(entries) {
  return [...entries].sort((a, b) => a.path.localeCompare(b.path))
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

main().catch((error) => {
  console.error('[sitemap] generation failed')
  console.error(error)
  process.exitCode = 1
})
