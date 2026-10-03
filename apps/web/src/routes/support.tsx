import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Mail, MessageCircle, Bug, Clock } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

const CHANNELS = [
  {
    icon: Mail,
    title: 'Email support',
    body: 'For anything that is not urgent — billing questions, account access, or feedback on how Payo is behaving.',
    action: 'support@payo.live',
    href: 'mailto:support@payo.live',
    note: 'We reply within 1–2 business days.',
  },
  {
    icon: Bug,
    title: 'Report a failed order',
    body: 'If an agent placed an order incorrectly, could not complete checkout, or charged you when it should not have, tell us the order ID and what went wrong.',
    action: 'orders@payo.live',
    href: 'mailto:orders@payo.live?subject=Order%20issue',
    note: 'Include the order ID — it lets us pull the platform logs directly.',
  },
  {
    icon: MessageCircle,
    title: 'Troubleshooting an agent connection',
    body: 'If your agent cannot reach Payo, cannot find your saved addresses, or is ordering to the wrong place.',
    action: 'See common fixes below',
    href: '#fixes',
    note: 'Most connection problems are a missing API key or an expired OAuth session.',
  },
]

const FIXES = [
  {
    q: 'My agent says "unauthorized"',
    a: 'The agent is calling Payo without valid credentials. Reconnect the plugin so ChatGPT completes a fresh OAuth sign-in, or generate a new API key from Settings → API keys and update your agent’s MCP configuration.',
  },
  {
    q: 'My agent cannot find any delivery addresses',
    a: 'Addresses are only visible to the account that saved them. Add an address in Settings → Delivery Addresses while signed in to the same account you connected to the agent.',
  },
  {
    q: 'Search returns no results for my area',
    a: 'Quick-commerce stock depends on the exact dark store serving your address, so the address coordinates matter. Update your saved address with accurate latitude and longitude, then search again.',
  },
  {
    q: 'An order says "COD is not available on Zepto"',
    a: 'Zepto does not offer cash on delivery through our integration. Choose Blinkit for COD, or use wallet payment on Zepto.',
  },
  {
    q: 'Checkout is taking a long time',
    a: 'Placing an order drives a real browser session on our side, which typically takes 30–90 seconds. Larger catalogues take longer. If it exceeds three minutes, the order fails safely and nothing is charged.',
  },
]

function SupportPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Payo
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Support</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Something not working, or an order that went wrong? Start here.
      </p>

      <div className="mt-8 grid gap-4">
        {CHANNELS.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
                  <c.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">{c.title}</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                  <a
                    href={c.href}
                    className="mt-2 inline-block text-[13px] font-medium text-primary hover:underline"
                  >
                    {c.action}
                  </a>
                  <p className="mt-1 text-[11px] text-muted-foreground">{c.note}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Payo is in active development. We answer every message.
      </div>

      <section id="fixes" className="mt-12 scroll-mt-8">
        <h2 className="text-xl font-semibold tracking-tight">Common fixes</h2>
        <div className="mt-4 divide-y divide-border rounded-xl border">
          {FIXES.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                {f.q}
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-12 text-xs text-muted-foreground">
        See also our{' '}
        <Link to="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  )
}