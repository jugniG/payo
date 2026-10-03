import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

const UPDATED = 'October 3, 2026'

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Payo
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {UPDATED}</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/80">
        <p>
          Payo (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a service that lets AI agents
          search and place orders on quick-commerce platforms on your behalf. This policy
          explains what data we collect, why we collect it, and what we never do with it.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-foreground">Account data</strong> — your name and
              email address, used to sign you in and identify your orders.
            </li>
            <li>
              <strong className="text-foreground">Delivery addresses</strong> — the
              recipient name, phone number, and address you save in the dashboard. These
              are required so an agent can check out on your behalf.
            </li>
            <li>
              <strong className="text-foreground">Order records</strong> — what was
              ordered, from which platform, the amount, and the status.
            </li>
            <li>
              <strong className="text-foreground">Wallet balance</strong> — the prepaid
              balance you maintain for agent purchases.
            </li>
            <li>
              <strong className="text-foreground">API keys</strong> — keys you generate to
              connect an agent. We store only a hash, never the key itself.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">What we do NOT collect</h2>
          <ul className="ml-5 list-disc space-y-2">
            <li>We never store your card details. Payments are processed on the platform&rsquo;s side.</li>
            <li>
              We do not read, store, or log the contents of your conversations with your
              AI agent.
            </li>
            <li>We do not sell or share your personal data with third parties.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">How third-party platforms are involved</h2>
          <p>
            To fulfil an order, our automation service signs into the quick-commerce
            platform on your behalf and submits your delivery address to complete checkout.
            Those platforms receive your delivery address and recipient phone number as part
            of the order. They are also the independent controllers of that data once the
            order is placed, and their own privacy policies apply to it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Data retention</h2>
          <p>
            We retain account and order data for as long as your account is active. If you
            delete your account, we remove your personal data, addresses, and order history
            within 30 days, except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <p>
            Data is transmitted over TLS. API keys are stored as SHA-256 hashes, so a
            database breach does not expose usable credentials. Access to production
            systems is limited to the people who operate the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            You can request access to, correction of, or deletion of your personal data at
            any time by emailing us. You can also export or delete your account directly
            from the dashboard settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions about this policy can be sent to{' '}
            <a href="mailto:privacy@payo.live" className="underline">
              privacy@payo.live
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}