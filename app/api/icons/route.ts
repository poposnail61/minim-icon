import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const BRANCH = 'main'

const baseIconCss = `/* Minim Icon System */
.icon {
  display: inline-block;
  width: calc(1em * var(--ratio, 1));
  height: 1em;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
`

function isAdminRequest(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  return cookie
    .split(';')
    .map(part => part.trim())
    .includes('admin_session=true')
}

// Helper to interact with GitHub API
async function githubRequest(path: string, options: RequestInit = {}) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set')

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const error = await res.json()
    const requestError = new Error(error.message || 'GitHub API Error')
    ;(requestError as Error & { status?: number }).status = res.status
    throw requestError
  }
  return res.json()
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getSvgRatio(content: string) {
  const widthMatch = content.match(/width=["']?([\d.]+)["']?/)
  const heightMatch = content.match(/height=["']?([\d.]+)["']?/)

  if (widthMatch && heightMatch) {
    return parseFloat(widthMatch[1]) / parseFloat(heightMatch[1])
  }

  const viewBoxMatch = content.match(/viewBox=["']?([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)["']?/)
  if (viewBoxMatch) {
    return parseFloat(viewBoxMatch[3]) / parseFloat(viewBoxMatch[4])
  }

  return 1
}

function getAutoTagsForFilename(filename: string) {
  if (filename.endsWith('-solid.svg')) {
    return ['solid']
  }

  if (filename.endsWith('-outline.svg')) {
    return ['outline']
  }

  return []
}

async function addAutoTagsForIcon(filename: string) {
  const autoTags = getAutoTagsForFilename(filename)
  if (autoTags.length === 0) return []

  const path = 'data/tags.json'
  const iconName = filename.replace(/\.svg$/, '')
  let sha: string | undefined
  let currentTags: Record<string, string[]> = {}

  try {
    const existing = await githubRequest(path)
    sha = existing.sha
    const content = Buffer.from(existing.content, 'base64').toString('utf-8')
    currentTags = JSON.parse(content)
  } catch (error: any) {
    if (error.message !== 'Not Found') {
      throw error
    }
  }

  const nextIconTags = Array.from(new Set([...(currentTags[iconName] || []), ...autoTags]))
  if (nextIconTags.length === (currentTags[iconName] || []).length) {
    return []
  }

  const nextTags = {
    ...currentTags,
    [iconName]: nextIconTags
  }

  await githubRequest(path, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Update tags via Minim Icon`,
      content: Buffer.from(JSON.stringify(nextTags, null, 2)).toString('base64'),
      sha,
      branch: BRANCH
    })
  })

  return autoTags
}

async function purgeJsdelivrCache(paths: string[]) {
  const uniquePaths = Array.from(new Set(paths))

  await Promise.all(uniquePaths.map(async (path) => {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/')
    const url = `https://purge.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${BRANCH}/${encodedPath}`

    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.warn(`Failed to purge jsDelivr cache for ${path}: ${res.status}`)
      }
    } catch (error) {
      console.warn(`Failed to purge jsDelivr cache for ${path}:`, error)
    }
  }))
}

async function regenerateIconsCss(extraPurgePaths: string[] = []) {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(1000 * attempt)
      }

      await writeIconsCss(extraPurgePaths)
      return
    } catch (error) {
      lastError = error
      console.warn(`icons.css regeneration attempt ${attempt + 1} failed:`, error)
    }
  }

  throw lastError
}

async function writeIconsCss(extraPurgePaths: string[] = []) {
  const iconsData = await githubRequest('public/icons')
  const iconFiles = Array.isArray(iconsData)
    ? iconsData
      .filter((file: any) => file.name.endsWith('.svg'))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
    : []

  const iconRules = await Promise.all(iconFiles.map(async (file: any) => {
    let iconData
    try {
      iconData = await githubRequest(`public/icons/${file.name}`)
    } catch (error) {
      if ((error as Error & { status?: number }).status === 404) {
        return null
      }

      throw error
    }

    const svg = Buffer.from(iconData.content, 'base64').toString('utf-8')
    const name = file.name.replace(/\.svg$/, '')
    const url = `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${BRANCH}/public/icons/${file.name}`
    const ratio = Math.round(getSvgRatio(svg) * 10000) / 10000

    return `
.icon-${name} {
  --ratio: ${ratio};
  mask-image: url(${url});
  -webkit-mask-image: url(${url});
}`
  }))

  const path = 'public/icons.css'
  let sha: string | undefined
  try {
    const existing = await githubRequest(path)
    sha = existing.sha
  } catch (error: any) {
    if (error.message !== 'Not Found') {
      throw error
    }
  }

  await githubRequest(path, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Update icons.css via Minim Icon',
      content: Buffer.from(baseIconCss + iconRules.filter(Boolean).join('\n')).toString('base64'),
      sha,
      branch: BRANCH
    })
  })

  await purgeJsdelivrCache(['public/icons.css', ...extraPurgePaths])
}

export async function GET() {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    // 1. Fetch Icons
    let iconsData
    try {
      iconsData = await githubRequest('public/icons')
    } catch (error: any) {
      if (error.message === 'Not Found') {
        iconsData = []
      } else {
        throw error
      }
    }

    // 2. Fetch Tags
    let tagsMap: Record<string, string[]> = {}
    try {
      const tagsRes = await githubRequest('data/tags.json')
      const content = Buffer.from(tagsRes.content, 'base64').toString('utf-8')
      tagsMap = JSON.parse(content)
    } catch (error: any) {
      // If tags.json doesn't exist, just use empty map
      if (error.message !== 'Not Found') {
        console.warn('Failed to fetch tags.json:', error)
      }
    }

    // 3. Merge and Return
    const icons = Array.isArray(iconsData)
      ? iconsData
        .filter((file: any) => file.name.endsWith('.svg'))
        .map((file: any) => {
          const name = file.name.replace('.svg', '')
          return {
            name: name,
            url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${BRANCH}/public/icons/${file.name}`,
            tags: tagsMap[name] || []
          }
        })
      : []

    return NextResponse.json({ icons })
  } catch (error) {
    console.error('GitHub List Error:', error)
    return NextResponse.json({ error: 'Failed to list icons from GitHub' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || !file.name.endsWith('.svg')) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const content = buffer.toString('base64')

    const filename = file.name.replace(/\s+/g, '-').toLowerCase()
    const path = `public/icons/${filename}`

    let sha: string | undefined
    try {
      const existing = await githubRequest(path)
      sha = existing.sha
    } catch (e) {
      // File doesn't exist, proceed with create
    }

    await githubRequest(path, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Upload ${filename} via Minim Icon`,
        content: content,
        sha: sha,
        branch: BRANCH
      })
    })

    const autoTags = await addAutoTagsForIcon(filename)

    let cssSynced = true
    let cssSyncError: string | undefined
    try {
      await regenerateIconsCss([path])
    } catch (error) {
      cssSynced = false
      cssSyncError = (error as Error).message
      console.warn('Icon uploaded, but icons.css sync failed:', error)
    }

    return NextResponse.json({ success: true, filename, autoTags, cssSynced, cssSyncError })
  } catch (error) {
    console.error('GitHub Upload Error:', error)
    return NextResponse.json({ error: 'Upload failed', details: (error as Error).message }, { status: 500 })
  }
}

// Delete Icon
export async function DELETE(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name || !name.endsWith('.svg')) {
      return NextResponse.json({ error: 'Invalid icon name' }, { status: 400 })
    }

    const path = `public/icons/${name}`

    let sha: string
    try {
      const fileData = await githubRequest(path)
      sha = fileData.sha
    } catch (e) {
      return NextResponse.json({ error: 'File not found on GitHub' }, { status: 404 })
    }

    await githubRequest(path, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Delete ${name} via Minim Icon`,
        sha,
        branch: BRANCH
      })
    })

    let cssSynced = true
    let cssSyncError: string | undefined
    try {
      await regenerateIconsCss([path])
    } catch (error) {
      cssSynced = false
      cssSyncError = (error as Error).message
      console.warn('Icon deleted, but icons.css sync failed:', error)
    }

    try {
      const tagsPath = 'data/tags.json'
      const tagsRes = await githubRequest(tagsPath)
      const content = Buffer.from(tagsRes.content, 'base64').toString('utf-8')
      const tagsMap = JSON.parse(content)
      const iconName = name.replace(/\.svg$/, '')

      if (Object.prototype.hasOwnProperty.call(tagsMap, iconName)) {
        delete tagsMap[iconName]

        await githubRequest(tagsPath, {
          method: 'PUT',
          body: JSON.stringify({
            message: `Update tags via Minim Icon`,
            content: Buffer.from(JSON.stringify(tagsMap, null, 2)).toString('base64'),
            sha: tagsRes.sha,
            branch: BRANCH
          })
        })
      }
    } catch (error: any) {
      if (error.message !== 'Not Found') {
        console.warn('Failed to remove deleted icon from tags.json:', error)
      }
    }

    return NextResponse.json({ success: true, cssSynced, cssSyncError })
  } catch (error) {
    console.error('GitHub Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete icon' }, { status: 500 })
  }
}

// Force Regenerate icons.css
export async function PATCH(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    await regenerateIconsCss()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CSS Sync Error:', error)
    return NextResponse.json({ error: 'Failed to sync icons.css', details: (error as Error).message }, { status: 500 })
  }
}

// Update Tags
export async function PUT(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    const { tags } = await request.json() // Expecting { "icon-name": ["tag1"], ... }

    const path = 'data/tags.json'
    let sha: string | undefined
    let currentTags = {}

    try {
      const existing = await githubRequest(path)
      sha = existing.sha
      const content = Buffer.from(existing.content, 'base64').toString('utf-8')
      currentTags = JSON.parse(content)
    } catch (e) {
      // File doesn't exist, start empty
    }

    const newTags = { ...currentTags, ...tags }
    // Clean up empty tags if needed? keeping it simple for now

    const content = Buffer.from(JSON.stringify(newTags, null, 2)).toString('base64')

    await githubRequest(path, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Update tags via Minim Icon`,
        content: content,
        sha: sha,
        branch: BRANCH
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GitHub Tag Update Error:', error)
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 })
  }
}
