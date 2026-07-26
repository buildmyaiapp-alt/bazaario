export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-gray-800">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Privacy Policy</h1>
      <p className="mb-8 text-sm text-gray-500">Last updated: July 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Bazario (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a demo e-commerce storefront. This
          policy explains what information we collect when you use the Bazario website or Android app,
          and how it is used.
        </p>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">Information We Collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account information: name, email address, and password (via Firebase Authentication).</li>
            <li>Order information: shipping address, phone number, items purchased, and order history.</li>
            <li>Payment information: processed directly by Razorpay. We do not store your card, UPI, or bank details.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">How We Use Your Information</h2>
          <p>
            We use this information to create and manage your account, process and deliver your orders,
            and show you your order history. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">Third-Party Services</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Firebase (Google) — authentication and database storage.</li>
            <li>Razorpay — payment processing.</li>
            <li>Vercel — website hosting.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">Data Retention</h2>
          <p>
            Account and order data is retained for as long as your account is active, or as needed to
            comply with legal obligations.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">Your Choices</h2>
          <p>
            You can request access to, correction of, or deletion of your account data at any time by
            contacting us at the email below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a href="mailto:palashrajak21@gmail.com" className="text-orange-600 hover:underline">
              palashrajak21@gmail.com
            </a>
            .
          </p>
        </section>

        <p className="text-xs text-gray-400">
          Bazario is a learning/demo project and is not affiliated with any real e-commerce brand.
        </p>
      </div>
    </div>
  );
}
