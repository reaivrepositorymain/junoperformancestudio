"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User,
    BarChart3,
    Shield,
    Database,
    Activity,
    Mail,
    Calendar,
    CreditCard,
    Package,
    UserCheck,
    AlertTriangle,
    Zap,
    Globe,
    Lock,
    Eye,
    Clipboard,
    PieChart,
    TrendingUp,
    Server,
    HardDrive
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const junoColors = [
    "#E84912", "#F6A100", "#D7770F", "#53B36A", "#438D34",
    "#67ACAA", "#64C2C6", "#3669B2", "#2953A1", "#719AD1"
];

// Define sidebar navigation items for admin
type AdminSidebarItem = {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    isSpecial?: boolean;
    itemCount?: number;
    category: 'main' | 'management' | 'analytics' | 'system';
};

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarHovered, setSidebarHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<{ name: string; profile_image?: string; role?: string } | null>(null);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const clientSidebar: { name: string; href: string; emoji: string }[] = [
        { name: "MUSH NATURALS", href: "/admin/clients/mush-naturals", emoji: "🍄" },
        { name: "HERBALS & HEALTH", href: "/admin/clients/herbals-health", emoji: "🌿" },
        { name: "VITAVIGNE", href: "/admin/clients/vitavigne", emoji: "🍇" },
        { name: "LELELÊ INTIMATES", href: "/admin/clients/lelele-intimates", emoji: "👙" },
        { name: "THE GARDEN", href: "/admin/clients/the-garden", emoji: "🪴" },
        { name: "ADOPTA MIU", href: "/admin/clients/adopta-miu", emoji: "🐱" },
        { name: "GET YOUR GUIDE", href: "/admin/clients/get-your-guide", emoji: "🧭" },
        { name: "GINGER", href: "/admin/clients/ginger", emoji: "💍" },
        { name: "LIBERTARIA STORE", href: "/admin/clients/libertaria-store", emoji: "⚗️" },
        { name: "FLORIST FOR FUN", href: "/admin/clients/florist-for-fun", emoji: "💐" },
        { name: "REHAUS", href: "/admin/clients/rehaus", emoji: "🏠" },
        { name: "VIUTY", href: "/admin/clients/viuty", emoji: "🧴" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [menuOpen]);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        // Mock admin user data
        setUser({
            name: "Admin User",
            role: "Administrator"
        });
    }, []);

    const handleLogout = async () => {
        try {
            toast.success("Logged out successfully!");
            router.push("/auth/admin/login");
        } catch (error: any) {
            toast.error("Logout failed.");
        }
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="min-h-screen bg-white">
                {/* Enhanced Top Navigation */}
                <header className="bg-white border-b-1 border-slate-500 sticky top-0 z-50 shadow-sm">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo with enhanced styling */}
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    <h1 className="font-brand text-2xl font-bold tracking-tight text-gray-900">
                                        JUNO
                                    </h1>
                                    <span className="text-[#E84912] text-sm font-semibold bg-[#E84912]/10 px-2 py-1 rounded-md">
                                        ADMIN
                                    </span>
                                </div>

                                {/* Breadcrumb */}
                                <div className="hidden md:flex items-center space-x-1">
                                    <div className="h-4 w-px bg-gray-300"></div>
                                    <span className="text-gray-600 text-sm font-medium">
                                        Admin Dashboard
                                    </span>
                                </div>
                            </div>

                            {/* Right side - Enhanced profile and actions */}
                            <div className="flex items-center space-x-3">
                                {/* System Status Indicator */}
                                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-gray-600 text-xs font-medium">System Healthy</span>
                                </div>

                                {/* Notifications with badge */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-all duration-200"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs text-white font-bold">7</span>
                                        </span>
                                    </button>
                                </div>

                                {/* Admin Menu */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className={`p-2 rounded-lg border transition-all duration-200 ${menuOpen
                                            ? 'bg-[#E84912] text-white border-[#E84912]'
                                            : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#E84912]'
                                            }`}
                                        onClick={() => setMenuOpen(!menuOpen)}
                                    >
                                        <div className="flex flex-col space-y-1 w-5 h-5 justify-center">
                                            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                                            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></div>
                                            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                                        </div>
                                    </button>
                                </div>

                                {/* Mobile menu button */}
                                <button
                                    type="button"
                                    className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-all duration-200"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Admin Menu Dropdown */}
                    <div className={`absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg transition-all duration-500 ease-in-out z-40 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                        } overflow-hidden`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {/* Quick Actions */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button
                                            className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left"
                                            onClick={() => router.push("/admin/dashboard/client/create")}
                                        >
                                            <UserCheck className="h-4 w-4" />
                                            <span>Add New Client</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Shield className="h-4 w-4" />
                                            <span>Security Audit</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Database className="h-4 w-4" />
                                            <span>Backup System</span>
                                        </button>
                                    </div>
                                </div>

                                {/* System Monitoring */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">System</h3>
                                    <div className="space-y-2">
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Activity className="h-4 w-4" />
                                            <span>System Health</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Server className="h-4 w-4" />
                                            <span>Server Logs</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Eye className="h-4 w-4" />
                                            <span>Monitoring</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Reports */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Reports</h3>
                                    <div className="space-y-2">
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <BarChart3 className="h-4 w-4" />
                                            <span>Usage Analytics</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>Performance</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Clipboard className="h-4 w-4" />
                                            <span>Export Data</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Settings</h3>
                                    <div className="space-y-2">
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Settings className="h-4 w-4" />
                                            <span>System Config</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Lock className="h-4 w-4" />
                                            <span>Permissions</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-600 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Globe className="h-4 w-4" />
                                            <span>Global Settings</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex">
                    {/* Left Sidebar */}
                    <aside
                        className="hidden lg:flex lg:w-20 lg:hover:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 lg:bg-white lg:border-r-1 lg:border-slate-500 lg:shadow-sm lg:transition-all lg:duration-300 lg:ease-in-out group"
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                    >
                        <div className="flex flex-col h-full min-h-0 py-4">
                            {/* Scrollable navigation container */}
                            <div className={`flex-1 ${sidebarHovered ? 'overflow-y-auto' : 'overflow-hidden'}`}>
                                <nav className="px-3 space-y-6">
                                    {/* Clients Section */}
                                    <div>
                                        {sidebarHovered && (
                                            <div className="px-3 mb-3">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Clients
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={`pr-1 ${sidebarHovered
                                                ? 'max-h-[650px]'
                                                : 'max-h-[650px] overflow-hidden'
                                                }`}
                                        >
                                            {clientSidebar.map((client, index) => {
                                                const isActive = pathname === client.href;
                                                const itemColor = junoColors[index % junoColors.length];
                                                return (
                                                    <Link
                                                        key={client.name}
                                                        href={client.href}
                                                        className={`w-full group/item relative flex items-center p-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                                                            ? 'text-white shadow-md'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                                                            }`}
                                                        style={{
                                                            backgroundColor: isActive ? itemColor : undefined
                                                        }}
                                                        title={client.name}
                                                    >
                                                        <span className="mr-2 pl-1 text-lg">{client.emoji}</span>
                                                        <span className={`flex-1 min-w-0 truncate transition-all duration-300 ${sidebarHovered
                                                            ? (isActive ? 'text-white font-semibold' : 'text-gray-600 group-hover/item:text-gray-900 opacity-100')
                                                            : 'opacity-0 w-0'
                                                            }`}>
                                                            {client.name}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </nav>
                            </div>

                            {/* Bottom Profile and Logout Section - sticky/fixed at bottom */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 px-3">
                                {/* Profile section */}
                                <div className="mb-3">
                                    <div className={`w-full flex items-center transition-all duration-300 border border-gray-200 hover:border-[#E84912]/20 shadow-sm hover:shadow-md cursor-pointer ${sidebarHovered
                                        ? 'gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100'
                                        : 'justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100'
                                        }`}>
                                        <div className="relative flex-shrink-0">
                                            <Avatar className={`ring-2 ring-gray-200 shadow-sm hover:ring-[#E84912] transition-all duration-300 ${sidebarHovered ? 'h-10 w-10' : 'h-8 w-8'
                                                }`}>
                                                <AvatarImage src="/admin-profile.jpg" alt="Admin" className="object-cover" />
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-[#E84912] to-[#d63d0e] text-white font-semibold">
                                                    {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "AD"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`absolute bg-green-500 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${sidebarHovered ? '-bottom-0.5 -right-0.5 w-3 h-3' : '-bottom-0.5 -right-0.5 w-2.5 h-2.5'
                                                }`}></div>
                                        </div>

                                        {sidebarHovered && (
                                            <div className="flex-1 min-w-0 transition-all duration-300 opacity-100 translate-x-0">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 text-sm font-semibold truncate leading-tight">
                                                        {user?.name || "Admin User"}
                                                    </span>
                                                    <span className="text-gray-500 text-xs truncate mt-0.5">
                                                        {user?.role || "Administrator"}
                                                    </span>
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                                            Online
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!sidebarHovered && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg opacity-0 group-hover:opacity-100">
                                                {user?.name || "Admin Profile"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Logout button */}
                                <button
                                    onClick={handleLogout}
                                    className={`w-full group/logout cursor-pointer flex items-center rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 relative border border-transparent hover:border-red-200 ${sidebarHovered ? 'gap-2 p-2' : 'justify-center p-2'
                                        }`}
                                    title="Sign out"
                                >
                                    <LogOut className="h-4 w-4 group-hover/logout:text-red-500 flex-shrink-0" />

                                    {sidebarHovered && (
                                        <span className="text-sm font-medium group-hover/logout:text-red-500 transition-all duration-300">
                                            Sign out
                                        </span>
                                    )}

                                    {!sidebarHovered && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg opacity-0 group-hover/logout:opacity-100">
                                            Sign out
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile sidebar with white theme */}
                    <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
                        <div
                            className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        />

                        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}>
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    type="button"
                                    className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-colors"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <X className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="pt-8 pb-4 px-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-gradient-to-br from-[#E84912] to-[#d63d0e] rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">J</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">JUNO ADMIN</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <main className={`flex-1 transition-all duration-300 ease-in-out ${sidebarHovered ? 'lg:pl-64' : 'lg:pl-20'
                        }`}>
                        <div className="tracking-tight">
                            <Suspense>{children}</Suspense>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}