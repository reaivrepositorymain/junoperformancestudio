'use client';

import {
  Scale,
  User,
  ShieldCheck,
  Link2,
  FileWarning,
  Power,
  Gavel,
  RefreshCw,
  Mail,
  Globe
} from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <header className="mb-10 flex items-center gap-3">
        <Scale className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service — Juno Performance Studio</h1>
      </header>
      <p className="text-sm text-gray-500 mb-8">Effective Date: <span className="font-medium">October 24, 2025</span></p>
      <section className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">1. Use of Services</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>You must be at least 18 years old and authorized to act on behalf of your business.</li>
            <li>Use Juno’s platform only for lawful purposes and in compliance with these Terms and all applicable platform (e.g. Meta, Google) policies.</li>
            <li>We reserve the right to suspend or terminate access if misuse or abuse is detected.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">2. Intellectual Property</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>All content, design, and software on Juno’s platform remain our property or that of our licensors.</li>
            <li>You may not copy, modify, or redistribute our materials without written consent.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">3. Account Responsibility</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>You’re responsible for maintaining the confidentiality of your credentials and for all activity under your account.</li>
            <li>Notify us immediately if you suspect unauthorized access.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">4. Third-Party Services</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>Our tools may connect to third-party APIs (such as Meta, Google, or TikTok).</li>
            <li>Use of those integrations is subject to the third party’s own terms and privacy policies.</li>
            <li>We access only the data necessary to provide your requested analytics and never modify your advertising assets unless explicitly authorized.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">5. Limitation of Liability</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>To the fullest extent permitted by law, Juno is not liable for indirect, incidental, or consequential damages arising from the use or inability to use our services.</li>
            <li>Our total liability will not exceed the amount you paid to us in the 12 months preceding the claim.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Power className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">6. Termination</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>We may suspend or end your access at any time if we believe you’ve violated these Terms.</li>
            <li>You may stop using Juno at any time by contacting us to close your account.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">7. Governing Law</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>These Terms are governed by the laws of <span className="font-medium">[your country/state]</span>.</li>
            <li>Any disputes will be handled by courts located in <span className="font-medium">[your jurisdiction]</span>.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">8. Updates to Terms</h2>
          </div>
          <ul className="list-disc ml-7 text-gray-700 space-y-1">
            <li>We may revise these Terms periodically.</li>
            <li>Continued use of the platform after changes means you accept the new version.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">9. Contact</h2>
          </div>
          <ul className="ml-7 text-gray-700 space-y-1">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <a href="mailto:info@junoperformancestudio.com" className="underline hover:text-indigo-600">info@junoperformancestudio.com</a>
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