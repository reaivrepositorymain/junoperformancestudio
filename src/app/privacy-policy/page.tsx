'use client';

import {
  Shield,
  User,
  BarChart2,
  Link2,
  Cookie,
  Database,
  Lock,
  RefreshCw,
  Mail,
  Globe
} from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <header className="mb-10 flex items-center gap-3">
        <Shield className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy — Juno Performance Studio</h1>
      </header>
      <p className="text-sm text-gray-500 mb-8">
        Effective Date: <span className="font-medium">October 24, 2025</span>
      </p>
      <section className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">1. Information We Collect</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>
              <span className="font-medium">Account &amp; Contact Information</span> – name, email address, and business details when you sign up or contact us.
            </li>
            <li>
              <span className="font-medium">Usage Data</span> – log files, analytics events, browser type, and interactions with our site.
            </li>
            <li>
              <span className="font-medium">Connected Platform Data</span> – if you authorize Juno to connect to third-party services (e.g. Meta, Google), we may access analytics data such as campaign performance metrics (impressions, spend, clicks) as allowed by that platform’s API.
            </li>
            <li>
              <span className="font-medium">Cookies &amp; Tracking</span> – for session management, analytics, and improving our service.
            </li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">2. How We Use Information</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>Provide, maintain, and improve our services.</li>
            <li>Retrieve and visualize marketing performance data at your request.</li>
            <li>Communicate with you regarding support or updates.</li>
            <li>Ensure security and compliance with platform policies.</li>
            <li className="font-medium">We do not sell your personal data or advertising data to any third parties.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">3. How We Share Information</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>With service providers that help us host, store, or process information (under strict confidentiality).</li>
            <li>To comply with legal obligations or enforce our rights.</li>
            <li>Never for advertising resale or third-party marketing.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">4. Data Storage &amp; Security</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>We use encrypted storage and HTTPS for data in transit.</li>
            <li>Access tokens and API credentials are kept in secure environments and rotated periodically.</li>
            <li>You may request deletion of your data at any time by contacting us at <span className="font-medium">[your email here]</span>.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">5. Your Rights</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>Depending on your location, you may have rights to access, correct, delete, or export your data.</li>
            <li>To exercise them, contact us at <span className="font-medium">[your email]</span>.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">6. Changes</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>We may update this Privacy Policy occasionally.</li>
            <li>Any major changes will be posted on this page with an updated date.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">7. Contact Us</h2>
          </div>
          <ul className="ml-7 text-gray-700 space-y-1">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>
                <a href="mailto:info@junoperformancestudio.com" className="underline hover:text-indigo-600">info@junoperformancestudio.com</a>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <a href="https://portal.junoperformancestudio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">portal.junoperformancestudio.com</a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}