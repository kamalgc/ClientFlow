"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { AppSidebar } from "@/components/app-sidebar"
// import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import {
  FileText,
  Clock3,
  FileCheck2,
  AlertTriangle,
  Filter,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Moon,
  Sun,
  Check,
  User,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('en-US');

// -------------- THEME TOGGLE -----------------
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Toggle theme" className="h-9 w-9">
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={theme === "light"}
          onCheckedChange={() => setTheme("light")}
        >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "dark"}
          onCheckedChange={() => setTheme("dark")}
        >
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "system"}
          onCheckedChange={() => setTheme("system")}
        >
          System
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DocIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect x="8" y="6" width="32" height="36" rx="6" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="16" y1="18" x2="28" y2="18" stroke="currentColor" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="26" x2="34" y2="26" stroke="currentColor" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="32" x2="30" y2="32" stroke="currentColor" strokeOpacity="0.4"  strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// -------------- KPI CARDS -----------------
function MetricCard({ title, value, icon, srcc }: { title: string; value: string | number; icon: React.ReactNode ; srcc:String}) {
  return (
    // <Card className="border-muted-foreground/10 bg-card/60 shadow-sm">
    //   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //     <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    //     <div className="text-muted-foreground">
    //       <img src="/Icons/Files01.png" alt="" />
    //     </div>
    //   </CardHeader>
    //   <CardContent>
    //     <div className="text-3xl font-semibold tracking-tight">{value}</div>
    //   </CardContent>
    // </Card>

    <Card className="
      relative overflow-hidden rounded-xl
      border border-white/10
      bg-[rgb(22,22,24)] backdrop-blur
      shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_8px_30px_rgba(0,0,0,0.35)]
      text-white
    ">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* left */}
          <div className="flex-1 px-5 py-3">
            <div className="text-xs font-medium text-white/60">{title}</div>
            <div className="mt-1 text-4xl font-bold leading-none tracking-tight">
              {value}
            </div>
          </div>

          {/* vertical divider */}
          <div className="w-px self-stretch bg-white/10" />

          {/* right glossy icon block */}
          <div
            className="
              relative shrink-0
              flex-1 items-center justify-center
              
            "
          >
            {/* subtle inner highlight */}
              <img src={srcc.toString()} alt="" />
            <div className="relative">
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KPICards() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <MetricCard srcc="/Icons/Files01.png" title="Active Contracts" value={150} icon={<FileText className="h-5 w-5" />} />
      <MetricCard srcc="/Icons/Ticks.png" title="Pending signatures" value={267} icon={<Clock3 className="h-5 w-5" />} />
      <MetricCard srcc="/Icons/Files01.png" title="Total contracts" value={680} icon={<FileCheck2 className="h-5 w-5" />} />
      <MetricCard srcc="/Icons/Files01.png" title="Expiring soon" value={22} icon={<AlertTriangle className="h-5 w-5" />} />
    </div>
  )
}

// -------------- CHART -----------------
// --- data (added a dashed "planned" line to match the mock) ---
const chartData = [
  { month: "Jan", signed: 180, planned: 210 },
  { month: "Feb", signed: 150, planned: 140 },
  { month: "Mar", signed: 210, planned: 200 },
  { month: "Apr", signed: 280, planned: 330 },
  { month: "May", signed: 160, planned: 230 },
  { month: "Jun", signed: 200, planned: 210 },
]

function SignedOverTime() {
  return (
    <Card
      className="
        overflow-hidden rounded-xl
        border border-white/10
        bg-[rgb(26,26,28)]/95 text-white
        shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_8px_30px_rgba(0,0,0,0.35)]
      "
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Signed over time</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-2 rounded-md border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-80">
            <path d="M7 11h10M7 15h7M16 3v4M8 3v4M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
              stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Jan – Jun
        </Button>
      </CardHeader>

      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <defs>
              {/* soft fade under the main line */}
              <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
              </linearGradient>

              {/* diagonal hatch overlay */}
              <pattern
                id="diagonalHatch"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="8" height="8" fill="transparent" />
                <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2" />
              </pattern>

              {/* slight glow for the main line */}
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ffffff" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* thin horizontal grid only */}
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray=""
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              style={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={30}
              tickMargin={8}
              style={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
              domain={[0, 400]}
            />

            {/* minimal tooltip that feels native to dark UI */}
            <Tooltip
              cursor={{ strokeOpacity: 0.1 }}
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null
                const p = payload.find((d: any) => d.dataKey === "signed") ?? payload[0]
                return (
                  <div className="rounded-md border border-white/10 bg-[rgb(26,26,28)]/95 px-3 py-1.5 text-xs shadow">
                    <div className="font-medium">{p.payload.month}</div>
                    <div className="text-white/70">Signed: {p.payload.signed}</div>
                  </div>
                )
              }}
            />

            {/* dashed "planned" line (no fill) */}
            <Area
              type="monotone"
              dataKey="planned"
              stroke="#ffffff"
              strokeOpacity={0.35}
              strokeWidth={2}
              strokeDasharray="6 6"
              fill="transparent"
              activeDot={false}
              dot={false}
              connectNulls
            />

            {/* main filled area */}
            <Area
              type="monotone"
              dataKey="signed"
              stroke="#ffffff"
              strokeWidth={2.5}
              fill="url(#areaFade)"
              filter="url(#softGlow)"
              dot={false}
              activeDot={{ r: 3, fill: "#fff" }}
              connectNulls
            />
            {/* hatch overlay on the same area */}
            <Area
              type="monotone"
              dataKey="signed"
              stroke="none"
              fill="url(#diagonalHatch)"
              dot={false}
              activeDot={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CalendarBadge() {
  return (
    <span className="ml-1 inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] text-muted-foreground">Filter</span>
  )
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-md border bg-popover px-3 py-1.5 text-xs shadow">
      <div className="font-medium">{p.payload.month}</div>
      <div className="text-muted-foreground">Signed: {p.value}</div>
    </div>
  )
}

// --- DATA (unchanged) ---
const recentContracts = [
  { name: "Growth Plan",         recipient: { name: "James Walker",     img: "/avatars/01.png" }, due: "2025-08-12" },
  { name: "Marketing Strategy",  recipient: { name: "Sarah Chen",       img: "/avatars/02.png" }, due: "2025-09-15" },
  { name: "Product Launch",      recipient: { name: "Michael Johnson",  img: "/avatars/03.png" }, due: "2025-10-20" },
  { name: "User Research",       recipient: { name: "Emily Davis",      img: "/avatars/04.png" }, due: "2025-11-05" },
  { name: "Budget Review",       recipient: { name: "David Lee",        img: "/avatars/05.png" }, due: "2025-12-01" },
]

// small folder tile to match the left icon in each row
function FolderTile() {
  return (
    <div className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M4 6h5l2 2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
          fill="currentColor" opacity=".7" />
        <rect x="7.5" y="10" width="5.5" height="1.6" rx=".8" fill="#fff" opacity=".55" />
      </svg>
    </div>
  )
}

function RecentContracts() {
  return (
    <Card
      className="
        overflow-hidden rounded-xl
        border border-white/10
        bg-[rgb(26,26,28)]/95 text-white
        shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_8px_30px_rgba(0,0,0,0.35)]
      "
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Recent contracts</CardTitle>

        <div className="flex items-center gap-2">
          {/* search pill */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              placeholder="Search"
              className="
                h-8 w-44 rounded-md border-white/10 bg-white/5 pl-8
                text-xs text-white/80 placeholder:text-white/40
                focus-visible:ring-0 focus-visible:border-white/20
              "
            />
          </div>

          {/* filter pill */}
          <Button
            variant="outline"
            size="sm"
            className="
              h-8 gap-2 rounded-md border-white/10 bg-white/5 px-3
              text-xs text-white/80 hover:bg-white/10
            "
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* space between rows + rounded backgrounds per row */}
        <Table className="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[45%] text-xs text-white/60">Paper name</TableHead>
              <TableHead className="text-xs text-white/60">Recipient</TableHead>
              <TableHead className="text-right text-xs text-white/60">Due date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {recentContracts.map((r) => (
              <TableRow
                key={r.name}
                className="
                  rounded-lg border border-white/10 bg-white/[0.05]
                  hover:bg-white/[0.07]
                "
              >
                {/* Paper name */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-3">
                    <FolderTile />
                    <span className="font-medium">{r.name}</span>
                  </div>
                </TableCell>

                {/* Recipient */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white/15">
                      <AvatarImage src={r.recipient.img} alt={r.recipient.name} />
                      <AvatarFallback className="text-[10px]">
                        {r.recipient.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white/90">{r.recipient.name}</span>
                  </div>
                </TableCell>

                {/* Due date (right, small tag) */}
                <TableCell className="py-2 text-right">
                  <span
                    className="
                      inline-flex items-center rounded-md border border-white/10
                      bg-white/5 px-2 py-1 text-xs text-white/80
                    "
                  >
                    {r.due}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// -------------- CONTACTS / SECTION CARDS -----------------
const contactCards = [
  {
    title: "NDA Agreement",
    desc: "To make sure our data is secure when we build",
    count: 240,
  },
  {
    title: "Service Level Agreement",
    desc: "Defines the expected level of service performance",
    count: 50,
  },
  {
    title: "User Onboarding Guide",
    desc: "A comprehensive guide to help new users start",
    count: 89,
  },
  {
    title: "Privacy Policy",
    desc: "Details on how we handle user data and privacy",
    count: 350,
  },
]

function ContactCard({ title, desc, count }: { title: string; desc: string; count: number }) {
  return (
    <Card className="group relative overflow-hidden border-muted-foreground/10 bg-[rgb(26,26,28)]/95 text-white">
      <CardContent className="pt-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-10 w-16 rounded-md bg-muted">
            <img src="/icons/folder.png" alt="" className="bg-[rgb(26,26,28)]/95 text-white"/>
          </div>
          <div className="flex -space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="">
                  <User className="h-3 bg-[rgb(26,26,28)]/95 text-white"/>
                </AvatarFallback>
              </Avatar>
            ))}
            <Badge variant="secondary" className="bg-[rgba(0, 0, 0, 1)] text-white ml-2 h-6 rounded-md px-2 text-[10px]">{count}+</Badge>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <Button variant="secondary" className="h-8 px-3 text-xs bg-[rgb(26,26,28)]/95 text-white"><ShareIcon className="mr-2 h-3.5 w-3.5" />Share</Button>
          <Button variant="outline" className="h-8 px-3 text-xs"><PencilIcon className="mr-2 h-3.5 w-3.5" />Edit</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ContactsSection() {
  return (
    <Card className="shadow-sm bg-[rgb(26,26,28)]/95 text-white">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Your Contacts</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="h-9 w-48 pl-8" placeholder="Search" />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              Categories
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {contactCards.map((c) => (
            <ContactCard key={c.title} {...c} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
}
function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
}

// -------------- PAGE SHELL -----------------
export default function DashboardAnalytic() {
  return (
      <SidebarInset>
        <div className="flex flex-1 flex-col ">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight">Welcome back John Doe!</h1>
                    <p className="text-xs text-muted-foreground">Last update at {timeString}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Create Contract</Button>
                  </div>
                </div>
                <KPICards />
              </div>

              <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
                <div className="lg:col-span-2"><SignedOverTime /></div>
                <div className="lg:col-span-1"><RecentContracts /></div>
              </div>

              <div className="px-4 lg:px-6">
                <ContactsSection />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    // {/* </SidebarProvider> */}
  )
}

function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button variant="outline" size="icon" className="h-9 w-9" aria-label="More">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
