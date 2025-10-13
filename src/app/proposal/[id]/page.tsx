"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Image from "next/image";
import Head from "next/head";
import { ProposalData } from "@/types/proposaldata";

export default function ProposalPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<ProposalData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProposal() {
            const res = await fetch(`/api/proposals/${id}`);
            if (!res.ok) {
                toast.error("Invalid or expired proposal link.");
                router.push("/");
                return;
            }
            const json = await res.json();
            setData(json);
            setLoading(false);
        }
        fetchProposal();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Toaster richColors position="top-center" />
                <div className="flex flex-col items-center">
                    <svg
                        className="animate-spin h-10 w-10 text-[#8CE232] mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                    <span className="text-lg font-semibold text-slate-700 animate-pulse">
                        Loading proposal...
                    </span>
                </div>
            </div>
        );
    }

    const { otp, proposal } = data!;
    const hero = proposal.hero;
    const solutions = proposal.solutions;
    const migrationProcess = proposal.migration_process;
    const pricingTiers = proposal.pricing || []; // New pricing array

    return (
        <>
            <Head>
                <title>{proposal.title}</title>
            </Head>
            <div className="bg-slate-50 text-slate-800 min-h-screen font-sans">
                <Toaster richColors position="top-center" />
                {/* Banner */}
                <div className="bg-black px-4 sm:px-8 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Image
                            src="/resources/images/reaiv-logo.png"
                            alt="Reaiv logo"
                            width={192}
                            height={48}
                            quality={100}
                            priority
                            className="h-8 sm:h-12 w-auto"
                        />
                        <span className="text-md md:text-xl font-bold ml-[-10px] text-white">x</span>
                        {proposal.logo_base64 ? (
                            <img src={proposal.logo_base64} alt="Proposal Logo" className="h-6 sm:h-9 w-auto" />
                        ) : (
                            <span className="text-slate-400 text-xs sm:text-sm">No logo</span>
                        )}
                    </div>
                </div>

                {/* Hero Section */}
                <section id="top" className="relative overflow-hidden py-[70px]">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#8CE232]/20 via-white to-emerald-50"></div>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
                        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                                <span className="text-[#8CE232]">Reaiv</span> x {proposal.client_name}
                            </h2>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            {hero.headline}
                        </h1>
                        <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto px-2">
                            {hero.subtitle}
                        </p>
                        <ul className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-16 text-sm">
                            {hero.highlights?.map((h, idx) => {
                                if (typeof h === "string") {
                                    return (
                                        <li key={h + idx} className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 w-full sm:w-[15rem] h-auto">
                                            <span className="block text-lg sm:text-2xl font-bold">{h}</span>
                                        </li>
                                    );
                                } else {
                                    return (
                                        <li key={h.title + idx} className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 w-full sm:w-[15rem] h-auto">
                                            <span className="block text-lg sm:text-2xl font-bold">{h.title}</span>
                                            <span className="block mt-2 text-slate-600 text-sm">{h.desc}</span>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                </section>

                {/* Overview Section */}
                <section id="overview" className="py-12 md:py-16 bg-white border-t border-b border-slate-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Overview</h2>
                        <p className="mt-3 md:mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto px-2">
                            {proposal.overview}
                        </p>
                        {proposal.overview_details?.title?.trim() && proposal.overview_details?.description?.trim() && (
                            <div className="mt-6 md:mt-8 text-left bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl p-4 md:p-5 mx-2 sm:mx-0">
                                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                                    {proposal.overview_details.title}
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {proposal.overview_details.description}
                                </p>
                                {proposal.overview_details.items?.length > 0 && (
                                    <ul className="mt-3 text-xs sm:text-sm text-slate-700 space-y-1.5 list-disc pl-4 sm:pl-5">
                                        {proposal.overview_details.items.map((item, idx) => (
                                            <li key={idx} className="leading-relaxed">
                                                <strong className="text-slate-900">{item.label}:</strong>{" "}
                                                <span className="text-slate-700">{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Proposed Solutions Section */}
                <section id="services" className="py-12 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                            Proposed Solutions
                        </h2>
                        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {solutions.map((card, idx) => (
                                <div key={idx} className="card rounded-2xl border border-[#8CE232] bg-white p-4 sm:p-6 hover:scale-[1.01] transition-transform">
                                    <h3 className="text-base sm:text-lg font-semibold">{card.title}</h3>
                                    <p className="mt-2 text-xs sm:text-sm text-slate-600">{card.description}</p>
                                    <ul className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-700 space-y-1 list-disc pl-4">
                                        {card.bullets.map((b: string, i: number) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                    {card.benefit && (
                                        <p className="mt-3 sm:mt-4 text-xs text-slate-500"><strong>Benefit:</strong> {card.benefit}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Updated Pricing Section */}
                {pricingTiers.length > 0 && (
                    <section id="pricing" className="py-16 sm:py-20 bg-white border-t border-b border-slate-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="flex items-end justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Pricing</h2>
                                    <p className="mt-2 text-sm sm:text-base text-slate-600">
                                        Simple, transparent tiers. Pick what fits today—scale when you need more.
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500">
                                    PHP pricing • Taxes, 3rd-party fees not included
                                </span>
                            </div>

                            {/* Dynamic Grid Layout based on number of tiers */}
                            <div className={`mt-8 grid gap-4 sm:gap-6 ${
                                pricingTiers.length === 1 
                                    ? 'grid-cols-1 max-w-sm mx-auto' // Single card - centered and narrow
                                    : pricingTiers.length === 2 
                                    ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' // Two cards - responsive
                                    : pricingTiers.length === 3 
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' // Three cards - responsive breakpoints
                                    : pricingTiers.length === 4
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' // Four cards - 2x2 on tablet, 1x4 on desktop
                                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' // 5+ cards - multiple rows
                            }`}>
                                {pricingTiers.map((tier, idx) => (
                                    <div
                                        key={idx}
                                        className={`relative block rounded-2xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ${
                                            tier.highlighted 
                                                ? 'border-[#8CE232] bg-gradient-to-br from-white to-[#8CE232]/10 shadow-lg scale-105' 
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        } ${
                                            // Make single card wider and highlighted cards stand out more
                                            pricingTiers.length === 1 ? 'min-h-[400px]' : 'min-h-[350px]'
                                        }`}
                                        aria-label={`${tier.name} Pricing`}
                                    >
                                        {tier.highlighted && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                <span className="bg-[#8CE232] text-black px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                    PREMIUM
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="text-center">
                                            <h3 className={`font-semibold text-slate-900 ${
                                                pricingTiers.length === 1 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                                            }`}>
                                                {tier.name}
                                            </h3>
                                            
                                            <div className="mt-3 sm:mt-4 flex items-baseline justify-center gap-1">
                                                <span className={`font-extrabold tracking-tight text-slate-900 ${
                                                    pricingTiers.length === 1 ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
                                                }`}>
                                                    {tier.price}
                                                </span>
                                            </div>
                                            
                                            <p className={`text-slate-500 mt-2 ${
                                                pricingTiers.length === 1 ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                                            }`}>
                                                {tier.description}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-4 sm:mt-6">
                                            <ul className={`space-y-2 text-slate-700 ${
                                                pricingTiers.length === 1 ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                                            }`}>
                                                {tier.features.map((feature, fIdx) => (
                                                    <li key={fIdx} className="flex items-start gap-2">
                                                        <span className="text-[#8CE232] mt-1 flex-shrink-0">✓</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        {/* Call to action for single pricing tier */}
                                        {pricingTiers.length === 1 && (
                                            <div className="mt-6 sm:mt-8 text-center">
                                                <button className="w-full bg-[#8CE232] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#7ab33a] transition-colors text-sm sm:text-base">
                                                    Get Started
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 sm:mt-12 space-y-4">
                                <p className="text-xs text-slate-500 text-center">
                                    Note: Complex software features, additional integrations, and compliance requirements may adjust the final
                                    estimate after discovery. Maintenance fees are not included.
                                </p>
                                
                                <div className="bg-[#8CE232] rounded-lg p-4 sm:p-6">
                                    <p className="text-sm sm:text-base text-center text-black font-medium">
                                        You can explore our portfolio on our website{" "}
                                        <span className="text-white font-semibold">
                                            <a 
                                                href="https://www.reaiv.com/portfolio" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="underline hover:no-underline transition-all"
                                            >
                                                Click Here!
                                            </a>
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Migration Process / Timeline Section */}
                <section id="process" className="py-12 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Migration & Delivery Process</h2>
                        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                            {migrationProcess.map((step, idx) => (
                                <div key={idx} className="rounded-2xl border border-slate-200 p-4 sm:p-6 bg-white">
                                    <span className="text-xs font-medium text-[#8CE232]">Step {idx + 1}</span>
                                    <h3 className="mt-1 text-sm sm:text-base font-semibold">{step.step}</h3>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section id="timeline" className="py-12 sm:py-16 bg-white border-t border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Projected Timeline</h2>
                        <p className="mt-2 text-slate-600 text-xs sm:text-sm">
                            Note: durations are estimates; we can compress or extend based on scope and feedback.
                        </p>
                        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                            {proposal.timelines?.map((timeline, idx) => (
                                <div key={idx} className="relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
                                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#8CE232] rounded"></div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-4 pl-4">{timeline.title}</h3>
                                    <ol className="mt-3 text-xs sm:text-sm text-slate-700 space-y-4 pl-4">
                                        {timeline.steps.map((step, sidx) => (
                                            <li key={sidx}>
                                                <div className="font-medium text-slate-900">{step.label}</div>
                                                <div className="text-slate-600">{step.desc}</div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-6 sm:py-8 border-t border-slate-200 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} Reaiv — Automation & Software Development
                </footer>
            </div>
        </>
    );
}