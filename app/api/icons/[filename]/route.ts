import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const BRANCH = 'main'

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    const { filename: rawFilename } = await params
    const filename = rawFilename + '.svg'
    const path = `public/icons/${filename}`

    // 1. Get file SHA (required for delete)
    let sha: string
    try {
      const fileData = await githubRequest(path)
      sha = fileData.sha
    } catch (e) {
      return NextResponse.json({ error: 'File not found on GitHub' }, { status: 404 })
    }

    // 2. Delete file
    await githubRequest(path, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Delete ${filename} via Minim Icon`,
        sha: sha,
        branch: BRANCH
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GitHub Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
