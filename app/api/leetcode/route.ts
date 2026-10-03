import { NextResponse } from "next/server"

const LEETCODE_USER = "vidishofficial"

// Never pre-render at build time — this route calls an external API that may
// be unreachable from the build environment. It executes on demand instead,
// with the upstream GraphQL response cached via the Data Cache below.
export const dynamic = "force-dynamic"

const QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { ranking }
    submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
  }
}
`

export async function GET() {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (portfolio telemetry)",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({ query: QUERY, variables: { username: LEETCODE_USER } }),
      next: { revalidate: 1800 }, // 30-minute Data Cache on the upstream response
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return NextResponse.json({ error: "leetcode unreachable" }, { status: 502 })
    const json = await res.json()
    const user = json?.data?.matchedUser
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 })

    const counts: Record<string, number> = {}
    for (const row of user.submitStatsGlobal?.acSubmissionNum ?? []) {
      counts[row.difficulty] = row.count
    }

    return NextResponse.json({
      username: user.username,
      ranking: user.profile?.ranking ?? null,
      solved: counts["All"] ?? 0,
      easy: counts["Easy"] ?? 0,
      medium: counts["Medium"] ?? 0,
      hard: counts["Hard"] ?? 0,
      profileUrl: `https://leetcode.com/u/${LEETCODE_USER}/`,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch LeetCode data" }, { status: 500 })
  }
}
