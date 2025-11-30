import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const BRANCH = 'main'

async function githubRequest(path: string) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set')
  
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }

  const res = await fetch(url, { headers })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'GitHub API Error')
  }
  return res.json()
}

export async function GET() {
  try {
    if (!GITHUB_TOKEN) {
      return new NextResponse('/* GITHUB_TOKEN not configured */', { 
        status: 500,
        headers: { 'Content-Type': 'text/css' }
      })
    }

    let data
    try {
      data = await githubRequest('public/icons')
    } catch (error: any) {
      if (error.message === 'Not Found') {
        data = []
      } else {
        throw error
      }
    }
    
    const icons = Array.isArray(data) 
      ? data
          .filter((file: any) => file.name.endsWith('.svg'))
          .map((file: any) => ({
            name: file.name.replace('.svg', ''),
            url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${BRANCH}/public/icons/${file.name}`
          }))
      : []

    const css = `
/* Minim Icon System */
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

${icons.map((icon: any) => `
.icon-${icon.name} {
  mask-image: url(${icon.url});
  -webkit-mask-image: url(${icon.url});
}`).join('\n')}
`

    return new NextResponse(css, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('CSS Generation Error:', error)
    return new NextResponse('/* Failed to generate CSS */', { 
      status: 500,
      headers: { 'Content-Type': 'text/css' }
    })
  }
}
