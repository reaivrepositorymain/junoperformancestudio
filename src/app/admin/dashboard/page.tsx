"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    UserCheck,
    Package,
    FileText,
    TrendingUp,
    TrendingDown,
    Activity,
    Server,
    Database,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart,
    Globe,
    Mail,
    Calendar,
    Zap,
    Eye,
    Download,
    Upload,
    RefreshCw,
    Settings,
    Bell,
    HardDrive,
    Cpu,
    Wifi,
    Monitor
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [systemStatus, setSystemStatus] = useState('healthy');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const router = useRouter();

    const campaigns = [
        {
            id: 1,
            title: "Spring Launch Campaign",
            description: "Kickoff for the new product line with email and social media.",
            status: "Running",
            statusColor: "green",
            tags: ["Marketing", "Email", "Q3"],
            stats: {
                Delivered: 2156,
                Opened: 1890,
                Clicked: 1205,
                Converted: 234,
            },
        },
        {
            id: 2,
            title: "Summer Sale",
            description: "Seasonal discount campaign for all customers.",
            status: "Paused",
            statusColor: "yellow",
            tags: ["Sales", "Discount", "Summer"],
            stats: {
                Delivered: 3120,
                Opened: 2500,
                Clicked: 980,
                Converted: 120,
            },
        },
        {
            id: 3,
            title: "Product Feedback",
            description: "Collecting user feedback for the latest release.",
            status: "Completed",
            statusColor: "blue",
            tags: ["Product", "Survey", "Feedback"],
            stats: {
                Delivered: 1800,
                Opened: 1600,
                Clicked: 900,
                Converted: 300,
            },
        },
        {
            id: 4,
            title: "VIP Client Outreach",
            description: "Personalized outreach to top-tier clients.",
            status: "Running",
            statusColor: "green",
            tags: ["CRM", "VIP", "Personal"],
            stats: {
                Delivered: 400,
                Opened: 350,
                Clicked: 200,
                Converted: 80,
            },
        },
    ];

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 1000);

        // Update time every second
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#E84912] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black text-lg">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="px-20 mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600">
                            Welcome back! Here's what's happening with your Campaigns today.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Current Time</p>
                            <p className="text-gray-900 font-mono">
                                {currentTime.toLocaleTimeString()}
                            </p>
                        </div>
                        <Button className="bg-[#E84912] hover:bg-[#d63d0e] text-white">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Filter & Sorting Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <select className="border rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E84912]">
                            <option>Active</option>
                            <option>Archived</option>
                        </select>
                        <select className="border rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E84912]">
                            <option>Status: Running</option>
                            <option>Status: Paused</option>
                            <option>Status: Completed</option>
                        </select>
                        <select className="border rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E84912]">
                            <option>Tag: All</option>
                            <option>Tag: Marketing</option>
                            <option>Tag: Sales</option>
                            <option>Tag: Product</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Sort by:</span>
                        <select className="border rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E84912]">
                            <option>Newest</option>
                            <option>Oldest</option>
                            <option>Status</option>
                            <option>Title</option>
                        </select>
                        <button className="ml-2 px-3 py-2 rounded-lg bg-[#E84912] text-white hover:bg-[#d63d0e] transition">+ Add Card</button>
                    </div>
                </div>

                {/* Modern Card List */}
                <div className="flex flex-col gap-6">
                    {campaigns.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4 text-left cursor-pointer"
                            onClick={() => router.push(`/admin/dashboard/campaign/${card.id}`)}
                            tabIndex={0}
                            role="button"
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === " ") {
                                    router.push(`/admin/dashboard/campaign/${card.id}`);
                                }
                            }}
                        >
                            {/* Title & Subtitle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                                </div>
                                {/* Status Badge */}
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border
                                    ${card.statusColor === "green" && "bg-green-50 text-green-700 border-green-200"}
                                    ${card.statusColor === "yellow" && "bg-yellow-50 text-yellow-700 border-yellow-200"}
                                    ${card.statusColor === "blue" && "bg-blue-50 text-blue-700 border-blue-200"}
                                `}
                                >
                                    {card.status}
                                </span>
                            </div>
                            {/* Tags */}
                            <div className="flex gap-2 flex-wrap">
                                {card.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{tag}</span>
                                ))}
                            </div>
                            {/* Statistics Row */}
                            <div className="flex items-center gap-8 mt-2">
                                {Object.entries(card.stats).map(([label, value]) => (
                                    <div key={label} className="flex flex-col items-center">
                                        <span className="text-gray-500 text-xs">{label}</span>
                                        <span className="font-bold text-gray-900">{value}</span>
                                    </div>
                                ))}
                                {/* Actions */}
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                                        title="Edit"
                                        onClick={e => { e.stopPropagation(); /* handle edit */ }}
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                                        title="More"
                                        onClick={e => { e.stopPropagation(); /* handle more */ }}
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <circle cx="12" cy="6" r="1" />
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="18" r="1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}