"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

interface GitHubData {
  profile: {
    login: string
    public_repos: number
    followers: number
    following: number
    created_at: string | null
    bio: string | null
  }
  pushEvents: {
    repo: string
    date: string
    message: string
    commits: number
  }[]
  activityGrid: { date: string; count: number }[]
  topRepos: {
    name: string
    description: string | null
    language: string | null
    stars: number
    pushed: string
    url: string
  }[]
}

// Fully deterministic fallback — no Date.now(), no Math.random()
// Dates are hardcoded; relative labels computed client-side only after mount
const STATIC_FALLBACK: GitHubData = {
  profile: { login: "Vidish-Bijalwan", public_repos: 20, followers: 42, following: 361, created_at: "2024-01-01T00:00:00Z", bio: null },
  pushEvents: [
    { repo: "portfolio",                 date: "2026-05-18T12:00:00Z", message: "Redesign: cinematic intelligence archive", commits: 14 },
    { repo: "Churn-And-Revenue-Forecaster", date: "2026-05-17T10:00:00Z", message: "Add SHAP explainability module",         commits: 3  },
    { repo: "SMART-TRAFFIC-OPTIMIZER",   date: "2026-05-16T08:00:00Z", message: "Optimize A* pathfinding",                 commits: 5  },
  ],
  // 28 hardcoded days ending 2026-05-18, deterministic counts
  activityGrid: [
    { date: "2026-04-21", count: 1 }, { date: "2026-04-22", count: 0 }, { date: "2026-04-23", count: 2 },
    { date: "2026-04-24", count: 3 }, { date: "2026-04-25", count: 0 }, { date: "2026-04-26", count: 1 },
    { date: "2026-04-27", count: 2 }, { date: "2026-04-28", count: 3 }, { date: "2026-04-29", count: 1 },
    { date: "2026-04-30", count: 2 }, { date: "2026-05-01", count: 3 }, { date: "2026-05-02", count: 2 },
    { date: "2026-05-03", count: 1 }, { date: "2026-05-04", count: 2 }, { date: "2026-05-05", count: 3 },
    { date: "2026-05-06", count: 0 }, { date: "2026-05-07", count: 1 }, { date: "2026-05-08", count: 3 },
    { date: "2026-05-09", count: 2 }, { date: "2026-05-10", count: 1 }, { date: "2026-05-11", count: 0 },
    { date: "2026-05-12", count: 0 }, { date: "2026-05-13", count: 2 }, { date: "2026-05-14", count: 1 },
    { date: "2026-05-15", count: 3 }, { date: "2026-05-16", count: 2 }, { date: "2026-05-17", count: 2 },
    { date: "2026-05-18", count: 3 },
  ],
  topRepos: [
    { name: "Churn-And-Revenue-Forecaster", description: "ML churn prediction engine",       language: "Python", stars: 0, pushed: "2026-05-18T12:00:00Z", url: "https://github.com/Vidish-Bijalwan/Churn-And-Revenue-Forecaster" },
    { name: "SMART-TRAFFIC-OPTIMIZER",      description: "Graph-based traffic flow optimizer", language: "Python", stars: 0, pushed: "2026-05-16T08:00:00Z", url: "https://github.com/Vidish-Bijalwan/SMART-TRAFFIC-OPTIMIZER" },
  ],
}

const LEETCODE_STATS = {
  solved: 46,
  total: 3935,
  easy: { solved: 29, total: 944 },
  medium: { solved: 15, total: 2057 },
  hard: { solved: 2, total: 934 },
  rank: 2664178,
  submissions: 52,
  activeDays: 16,
  maxStreak: 4,
  languages: [
    { lang: "Python", count: 40 },
    { lang: "C++",    count: 3  },
    { lang: "Java",   count: 2  },
  ],
}

const GITHUB_EXTRA = {
  stars: 4,
  commits: 168,
  contributions: 230,
}

const ACTIVE_FOCUS = [
  { label: "RAG pipeline exploration", active: true },
  { label: "Vector embedding experiments", active: true },
  { label: "AI infrastructure architecture", active: true },
  { label: "Portfolio redesign", active: false },
  { label: "LLM agent memory systems", active: true },
]

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return "recently"
  if (h < 24) return `${h}h ago`
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

function ActivityCell({ count, date }: { count: number; date: string }) {
  const intensity = count === 0 ? 0 : count === 1 ? 0.3 : count === 2 ? 0.55 : count >= 3 ? 0.85 : 0
  return (
    <div
      title={`${date}: ${count} event${count !== 1 ? "s" : ""}`}
      className="w-3 h-3 rounded-none transition-colors duration-250"
      style={{
        backgroundColor:
          count === 0
            ? "hsl(210,5%,10%)"
            : `hsl(38,90%,52%,${intensity})`,
        border: "1px solid hsl(210,5%,12%)",
      }}
    />
  )
}

export default function EngineeringLab() {
  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  // mounted guard: prevents SSR from rendering dynamic data that differs on client
  const [mounted, setMounted] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })

  useEffect(() => {
    setMounted(true)
    fetch("/api/github")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setData(STATIC_FALLBACK)
        else setData(d)
      })
      .catch(() => setData(STATIC_FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  // Use STATIC_FALLBACK as the initial server-rendered shell (deterministic data)
  // After mount, switch to live data from the API
  const github = data ?? STATIC_FALLBACK

  return (
    <section
      id="lab"
      className="relative py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(0,0%,4%) 0%, hsl(0,0%,5%) 100%)",
      }}
    >
      {/* Environment — alive, machine-driven feel */}
      {/* Subtle horizontal scan lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(0,0%,0%,0.08) 3px, hsl(0,0%,0%,0.08) 4px)",
        }}
      />
      {/* Right side atmospheric gradient */}
      <div
        className="absolute right-0 top-0 bottom-0 w-96 pointer-events-none"
        style={{
          background:
            "linear-gradient(270deg, hsl(38 90% 52% / 0.025) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16">
        {/* Section header */}
        <div ref={headerRef} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[hsl(38,90%,52%)]" />
            <span className="mono-label text-[10px]">ACT 04 · LIVE ENGINEERING LAB</span>
            {!loading && (
              <span className="status-active text-[9px] ml-2">TELEMETRY LIVE</span>
            )}
            {loading && (
              <span className="font-mono text-[9px] text-[hsl(210,5%,32%)] ml-2 animate-pulse">SYNCING...</span>
            )}
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="heading-editorial text-[hsl(40,10%,88%)] max-w-lg"
          >
            Engineering telemetry. Live.
          </motion.h2>
        </div>

        {/* Main grid — asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_340px] gap-0">

          {/* LEFT — commit feed + repo table */}
          <div className="lg:pr-12 space-y-12">

            {/* Commit log */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="mono-label">COMMIT FEED</p>
                <div className="flex-1 h-px bg-[hsl(210,5%,14%)]" />
              </div>
              <div
                className="rounded-sm overflow-hidden"
                style={{
                  background: "hsl(0,0%,3%)",
                  border: "1px solid hsl(210,5%,12%)",
                }}
              >
                {/* Terminal header */}
                <div
                  className="px-4 py-2 flex items-center gap-2 border-b border-[hsl(210,5%,10%)]"
                  style={{ background: "hsl(0,0%,6%)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-[hsl(145,50%,38%)] animate-pulse-amber" />
                  <span className="font-mono text-[10px] tracking-[0.15em] text-[hsl(210,5%,36%)]">
                    github.com/Vidish-Bijalwan · push log
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {github.pushEvents.length === 0 ? (
                    <p className="font-mono text-[11px] text-[hsl(210,5%,36%)]">No recent push events.</p>
                  ) : (
                    github.pushEvents.map((ev, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="flex flex-col gap-0.5 border-b border-[hsl(210,5%,8%)] pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-[hsl(38,90%,52%/0.8)]">
                            → push · {ev.repo}
                          </span>
                          <span className="font-mono text-[10px] text-[hsl(210,5%,32%)]" suppressHydrationWarning>
                            {mounted ? formatRelativeTime(ev.date) : "–"}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[hsl(210,5%,58%)] pl-4 truncate">
                          {ev.message}
                        </span>
                        <span className="font-mono text-[10px] text-[hsl(210,5%,30%)] pl-4">
                          {ev.commits} commit{ev.commits !== 1 ? "s" : ""}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Repository table */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="mono-label">REPOSITORIES</p>
                <div className="flex-1 h-px bg-[hsl(210,5%,14%)]" />
              </div>
              <div className="border border-[hsl(210,5%,12%)]">
                {github.topRepos.map((repo, i) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-[1fr_80px_60px] gap-4 px-6 py-4 border-b border-[hsl(210,5%,10%)] last:border-b-0 hover:bg-[hsl(0,0%,7%)] transition-colors duration-250 group"
                  >
                    <div>
                      <p className="font-mono text-[12px] text-[hsl(40,10%,80%)] group-hover:text-[hsl(38,90%,52%)] transition-colors duration-250 leading-snug">
                        {repo.name}
                      </p>
                      {repo.description && (
                        <p className="font-mono text-[10px] text-[hsl(210,5%,38%)] mt-0.5 truncate">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[hsl(210,5%,36%)] self-center">
                      {repo.language ?? "–"}
                    </span>
                    <span className="font-mono text-[10px] text-[hsl(210,5%,30%)] self-center text-right" suppressHydrationWarning>
                      {mounted ? formatRelativeTime(repo.pushed) : "–"}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Activity grid */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="mono-label">28-DAY VELOCITY</p>
                <div className="flex-1 h-px bg-[hsl(210,5%,14%)]" />
              </div>
              <div className="flex flex-wrap gap-1">
                {github.activityGrid.map((cell) => (
                  <ActivityCell key={cell.date} count={cell.count} date={cell.date} />
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-[9px] text-[hsl(210,5%,24%)]">LESS</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((v) => (
                    <ActivityCell key={v} count={v} date="" />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-[hsl(210,5%,24%)]">MORE</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block bg-[hsl(210,5%,12%)]" />

          {/* RIGHT — profile stats + active systems */}
          <div className="lg:pl-12 mt-12 lg:mt-0 space-y-10">

            {/* GitHub Profile stats */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="mono-label">GITHUB COMPUTE</p>
                <div className="flex-1 h-px bg-[hsl(210,5%,14%)]" />
              </div>
              <div className="space-y-0 border border-[hsl(210,5%,12%)]">
                {[
                  { label: "HANDLE", value: `@${github.profile.login}` },
                  { label: "REPOSITORIES", value: github.profile.public_repos.toString() },
                  { label: "CONTRIBUTIONS (1Y)", value: GITHUB_EXTRA.contributions.toString() },
                  { label: "COMMITS", value: GITHUB_EXTRA.commits.toString() },
                  { label: "STARS", value: GITHUB_EXTRA.stars.toString() },
                  { label: "FOLLOWERS", value: github.profile.followers.toString() },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-5 py-3 border-b border-[hsl(210,5%,10%)] last:border-b-0"
                  >
                    <span className="mono-label text-[10px]">{item.label}</span>
                    <span className="font-mono text-[12px] text-[hsl(40,10%,80%)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LeetCode Profile stats */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="mono-label">ALGORITHMIC TELEMETRY</p>
                <div className="flex-1 h-px bg-[hsl(210,5%,14%)]" />
              </div>
              <div className="space-y-0 border border-[hsl(210,5%,12%)]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(210,5%,10%)]">
                  <span className="mono-label text-[10px]">SOLVED</span>
                  <span className="font-mono text-[12px] text-[hsl(40,10%,80%)]">
                    {LEETCODE_STATS.solved} <span className="text-[hsl(210,5%,40%)]">/ {LEETCODE_STATS.total}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(210,5%,10%)]">
                  <span className="mono-label text-[10px]">BREAKDOWN</span>
                  <div className="flex gap-3 font-mono text-[11px]">
                    <span className="text-[hsl(145,50%,38%)]">{LEETCODE_STATS.easy.solved}E</span>
                    <span className="text-[hsl(38,90%,52%)]">{LEETCODE_STATS.medium.solved}M</span>
                    <span className="text-[hsl(0,80%,55%)]">{LEETCODE_STATS.hard.solved}H</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(210,5%,10%)]">
                  <span className="mono-label text-[10px]">GLOBAL RANK</span>
                  <span className="font-mono text-[12px] text-[hsl(40,10%,80%)]">{LEETCODE_STATS.rank.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="mono-label text-[10px]">PRIMARY LANG</span>
                  <span className="font-mono text-[12px] text-[hsl(40,10%,80%)]">Python</span>
                </div>
              </div>
            </div>

            {/* Active systems */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="mono-label">ACTIVE SYSTEMS</p>
                <div className="flex-1 h-px bg-[hsl(210,5%,14%)]" />
              </div>
              <div
                className="p-5 rounded-none space-y-3"
                style={{
                  background: "hsl(0,0%,3%)",
                  border: "1px solid hsl(210,5%,12%)",
                  borderLeft: "2px solid hsl(145,50%,38%,0.5)",
                }}
              >
                {ACTIVE_FOCUS.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="font-mono text-[11px] mt-0.5"
                      style={{ color: item.active ? "hsl(145,50%,38%)" : "hsl(210,5%,32%)" }}
                    >
                      {item.active ? "├──" : "└──"}
                    </span>
                    <span
                      className="font-mono text-[11px] leading-relaxed"
                      style={{ color: item.active ? "hsl(210,5%,65%)" : "hsl(210,5%,32%)" }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* External Links */}
            <div className="flex items-center justify-between">
              <a
                href="https://github.com/Vidish-Bijalwan"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-[11px] tracking-[0.1em] text-[hsl(210,5%,38%)] hover:text-[hsl(38,90%,52%)] transition-colors duration-250"
              >
                → GITHUB
              </a>
              <a
                href="https://leetcode.com/u/vidishofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-mono text-[11px] tracking-[0.1em] text-[hsl(210,5%,38%)] hover:text-[hsl(38,90%,52%)] transition-colors duration-250"
              >
                → LEETCODE
              </a>
            </div>

            <p className="font-mono text-[9px] tracking-[0.1em] text-[hsl(210,5%,20%)] text-right">
              REF–004 / LAB · REVALIDATES 30m
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
