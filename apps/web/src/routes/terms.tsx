import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

const UPDATED = 'October 3, 2026'

function TermsPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Payo
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {UPDATED}</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/80">
        <p>
          These terms govern your use of Payo. By creating an account or connecting an AI
          agent to our service, you agree to them.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-foreground">What Payo does</h2>
          <p>
            Payo gives AI agents the ability to search quick-commerce platforms and place
            orders on your behalf. You stay in control: an agent can only order to delivery
            addresses you have saved, and you approve each purchase either by confirming an
            order in your dashboard or by completing its payment authorisation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Your account</h2>
          <ul className="ml-5 list-disc space-y-2">
            <li>You must be at least 18 years old to use Payo.</li>
            <li>You are responsible for keeping your API keys secure.</li>
            <li>One person or organisation per account. Multiple-account use to evade limits is not permitted.</li>
            <li>
              You must provide accurate delivery information. Incorrect addresses will result
              in failed deliveries and may not be refundable.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Orders and payment</h2>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-foreground">Wallet payments</strong> — the order
              amount plus a service fee is deducted from your Payo wallet once you confirm
              the order.
            </li>
            <li>
              <strong className="text-foreground">Cash on delivery</strong> — you pay the
              delivery partner in cash at the door. A service fee is still deducted from your
              Payo wallet.
            </li>
            <li>
              Prices are shown in Indian Rupees and are determined by the underlying
              platform at the moment of checkout. We convert them for display using a
              current exchange rate.
            </li>
            <li>
              Service fees are deducted at the time an order is initiated, not on
              cancellation or failed delivery.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Refunds</h2>
          <p>
            Service fees are non-refundable once an order has been initiated, because the
            automation work has already been performed. For the cost of the goods themselves,
            refunds and cancellations are governed by the retailer&rsquo;s policy — contact
            us and we will help where we can, but we cannot guarantee a refund from a
            third-party platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Availability</h2>
          <p>
            Payo depends on third-party platforms we do not control. Their APIs, product
            availability, pricing, and checkout flows can change without notice, which may
            interrupt service. We work to keep the service running but do not guarantee
            uninterrupted availability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>Use Payo to violate any law or third-party platform&rsquo;s terms.</li>
            <li>Place orders you do not intend to receive.</li>
            <li>
              Attempt to resell or redistribute access to Payo without our written consent.
            </li>
            <li>
              Probe, scan, or attack our infrastructure, or attempt to access data
              belonging to another user.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Payo is not liable for indirect or
            consequential losses, including lost profits, missed deliveries, or damages
            arising from third-party platform behaviour. Our total liability is limited to
            the service fees you paid in the three months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Termination</h2>
          <p>
            You may delete your account at any time. We may suspend or terminate accounts
            that breach these terms, are used for fraud, or create risk to the service or
            to other users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p>
            We may update these terms. Material changes will be announced in the dashboard
            or by email before they take effect. Continuing to use Payo after a change means
            you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href="mailto:legal@payo.live" className="underline">
              legal@payo.live
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}