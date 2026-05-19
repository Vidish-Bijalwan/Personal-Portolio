import { NextResponse } from "next/server"

const GITHUB_USER = "Vidish-Bijalwan"

export const revalidate = 1800 // 30 minutes ISR cache

async function fetchGitHub(path: string) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 1800 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET() {
  try {
    const [user, events, repos] = await Promise.all([
      fetchGitHub(`users/${GITHUB_USER}`),
      fetchGitHub(`users/${GITHUB_USER}/events/public?per_page=20`),
      fetchGitHub(`users/${GITHUB_USER}/repos?sort=pushed&per_page=10`),
    ])

    // Extract push events with commit info
    const pushEvents = (events ?? [])
      .filter((e: any) => e.type === "PushEvent")
      .slice(0, 6)
      .map((e: any) => ({
        repo: e.repo?.name?.replace(`${GITHUB_USER}/`, "") ?? "unknown",
        date: e.created_at,
        message: e.payload?.commits?.[0]?.message?.split("\n")[0] ?? "commit",
        commits: e.payload?.size ?? 1,
        additions: null,
        deletions: null,
      }))

    // Build a basic 28-day activity grid (last 4 weeks)
    const activityGrid: { date: string; count: number }[] = []
    const now = new Date()
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const count = (events ?? []).filter((e: any) => {
        const eDate = new Date(e.created_at).toISOString().split("T")[0]
        return eDate === dateStr
      }).length
      activityGrid.push({ date: dateStr, count })
    }

    return NextResponse.json({
      profile: {
        login: user?.login ?? GITHUB_USER,
        public_repos: user?.public_repos ?? 0,
        followers: user?.followers ?? 0,
        following: user?.following ?? 0,
        created_at: user?.created_at ?? null,
        bio: user?.bio ?? null,
      },
      pushEvents,
      activityGrid,
      topRepos: (repos ?? []).slice(0, 4).map((r: any) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        pushed: r.pushed_at,
        url: r.html_url,
      })),
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch GitHub data" }, { status: 500 })
  }
}
