import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const BRANCH = 'main'

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
    throw new Error(error.message || 'GitHub API Error')
  }
  return res.json()
}

export async function GET() {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    let data
    try {
      data = await githubRequest('public/icons')
    } catch (error: any) {
      if (error.message === 'Not Found') {
        return NextResponse.json({ icons: [] })
      }
      throw error
    }

    // Filter for SVGs and map to raw URLs
    const icons = Array.isArray(data)
      ? data
        .filter((file: any) => file.name.endsWith('.svg'))
        .map((file: any) => ({
          name: file.name.replace('.svg', ''),
          url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${BRANCH}/public/icons/${file.name}`
        }))
      : []

    return NextResponse.json({ icons })
  } catch (error) {
    console.error('GitHub List Error:', error)
    return NextResponse.json({ error: 'Failed to list icons from GitHub' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({ success: true, filename })
  } catch (error) {
    console.error('GitHub Upload Error:', error)
    return NextResponse.json({ error: 'Upload failed', details: (error as Error).message }, { status: 500 })
  }
}
