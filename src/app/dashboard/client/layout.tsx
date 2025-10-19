"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    Leaf,
    Grape,
    Heart,
    TreePine,
    Cat,
    MapPin,
    Gem,
    FlaskConical,
    Flower,
    Home,
    Book,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User,
    BarChart3,
    MessageCircle,
    FolderOpen,
    Folder,
    // Add these new imports
    FileText,
    Camera,
    Film,
    Presentation,
    BookOpen,
    ThumbsUp,
    Package,
    Star,
    Award,
    Shirt,
    Newspaper,
    ImageDownIcon,
    MessageSquare,
    Play,
    List,
    Megaphone,
    Scale,
    GraduationCap,
    Users,
    Target,
    Video,
    RotateCcw,
    TrendingUp,
    HelpCircle,
    UserCheck,
    StickyNote,
    PlayCircle,
    Shuffle
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
import { Button } from "@/components/ui/button";
import { DndContext, useDroppable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { supabase } from "@/lib/supabase";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { AssetType, SidebarNavigationItem, DashboardLayoutProps } from "@/types/client-dashboard";
import { Separator } from "@/components/ui/separator";

const junoColors = [
    "#E84912", "#F6A100", "#D7770F", "#53B36A", "#438D34",
    "#67ACAA", "#64C2C6", "#3669B2", "#2953A1", "#719AD1"
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarHovered, setSidebarHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<{ name: string; profile_image?: string; role?: string } | null>(null);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [folders, setFolders] = useState<AssetType[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentFolder = searchParams.get('folder');

    // Fetch folders from API
    const fetchFolders = async () => {
        setLoadingFolders(true);
        try {
            const res = await fetch("/api/dashboard/client/assets");
            if (res.ok) {
                const data = await res.json();
                // Filter only folders and root level folders (no parent)
                const rootFolders = data.filter((item: AssetType) =>
                    item.type === 'folder' && item.parent_id === null
                );
                setFolders(rootFolders);
            }
        } catch (error) {
            console.error("Error fetching folders:", error);
        } finally {
            setLoadingFolders(false);
        }
    };

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
        fetchFolders();

        // Listen for custom event from page.tsx
        const handleAssetsUpdated = () => {
            fetchFolders();
        };
        window.addEventListener("assetsUpdated", handleAssetsUpdated);

        // Subscribe to real-time changes in the assets table
        const channel = supabase
            .channel('folders-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'assets',
                },
                (payload) => {
                    const newRow = payload.new as AssetType | undefined;
                    const oldRow = payload.old as AssetType | undefined;
                    if (
                        newRow?.type === 'folder' ||
                        oldRow?.type === 'folder' ||
                        newRow?.type === 'file' ||
                        oldRow?.type === 'file'
                    ) {
                        fetchFolders();
                    }
                }
            )
            .subscribe();

        // Cleanup on unmount
        return () => {
            channel.unsubscribe();
            window.removeEventListener("assetsUpdated", handleAssetsUpdated);
        };
    }, []);

    // Create sidebar navigation with consistent typing
    const sidebarNavigation: SidebarNavigationItem[] = [
        {
            name: "All Folders", // <-- Changed label here
            href: "/dashboard/client",
            icon: FolderOpen,
            isSpecial: true,
            itemCount: folders.length // Show total folders count
        },
        ...folders.map((folder): SidebarNavigationItem => ({
            name: folder.name,
            href: `/dashboard/client?folder=${encodeURIComponent(folder.name)}`,
            icon: Folder,
            isSpecial: false,
            folderId: folder.id,
            itemCount: folder.items || 0
        }))
    ];

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const res = await fetch("/api/auth/check", {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal,
                    cache: 'no-store'
                });

                clearTimeout(timeoutId);

                if (!res.ok) {
                    toast.error("You must be logged in to access this page.");
                    router.push("/auth/2.0/login");
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    toast.error("Authentication check timed out.");
                } else {
                    toast.error("Authentication check failed.");
                }
                router.push("/auth/2.0/login");
            }
        };

        checkAuth();
    }, [router]);

    async function fetchUser() {
        const res = await fetch("/api/dashboard/client");
        if (res.ok) {
            const data = await res.json();
            setUser(data);
            if (!data.profile_image) {
                setShowProfileDialog(true);
            } else {
                setShowProfileDialog(false);
            }
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    function ProfileDropZone({ children }: { children: React.ReactNode }) {
        const { setNodeRef, isOver } = useDroppable({ id: "profile-dropzone" });
        return (
            <div
                ref={setNodeRef}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed border-[#E84912] rounded-xl bg-[#E84912]/5 p-6 cursor-pointer transition-all duration-200 hover:bg-[#E84912]/10 ${isOver ? "bg-[#E84912]/20 border-[#E84912]" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                        setPreview(URL.createObjectURL(file));
                        setSelectedFile(file);
                    }
                }}
            >
                {children}
            </div>
        );
    }

    async function handleUpload() {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("image", selectedFile);

        const res = await fetch("/api/dashboard/client/image", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            toast.success("Profile image uploaded successfully!");
            setShowProfileDialog(false);
            await fetchUser();
        } else {
            const error = await res.json();
            toast.error(error.error || "Failed to upload image");
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const file = event.active.data.current?.file;
        if (file && file.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(file));
            setSelectedFile(file);
        }
    }

    const handleLogout = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                toast.success("Logged out successfully!");
                router.push("/auth/2.0/login");
            } else {
                toast.error("Logout failed.");
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.error("Logout request timed out.");
            } else {
                toast.error("Network error.");
            }
        }
    };

    // Handle folder navigation
    const handleFolderClick = (folderName: string, folderId?: string) => {
        // Navigate to client page with folder parameter
        router.push(`/dashboard/client?folder=${encodeURIComponent(folderName)}`);
        setSidebarOpen(false); // Close mobile sidebar
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                {/* Enhanced Top Navigation */}
                <header className="bg-slate-100 border-b-1 border-slate-500 sticky top-0 z-50 shadow-sm">
                    <div className="px-20mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo with enhanced styling */}
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    <h1 className="font-brand text-2xl font-bold tracking-tight text-black">
                                        JUNO
                                    </h1>
                                </div>

                                {/* Breadcrumb or current page indicator */}
                                <div className="hidden md:flex items-center space-x-1">
                                    <div className="h-4 w-px bg-gray-400"></div>
                                    <span className="text-gray-700 text-sm font-medium">
                                        {currentFolder ? `Files - ${currentFolder}` : 'Client Dashboard'}
                                    </span>
                                </div>
                            </div>

                            {/* Right side - Enhanced profile and actions */}
                            <div className="flex items-center space-x-3">
                                {/* Notifications with badge */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="bg-slate-200 p-2 rounded-lg text-gray-700 hover:text-black hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-all duration-200 flex items-center justify-center"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs text-white font-bold">3</span>
                                        </span>
                                    </button>
                                </div>

                                {/* Wonderful Hamburger Menu */}
                                <div className="relative">
                                    <Button
                                        type="button"
                                        className={`p-2 rounded-lg text-gray-700 hover:text-black hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-all duration-200 flex items-center justify-center ${menuOpen ? 'bg-[#E84912] text-white' : 'bg-slate-200'}`}
                                        onClick={() => setMenuOpen(!menuOpen)}
                                    >
                                        <div className="flex flex-col space-y-1 w-5 h-5 justify-center">
                                            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                                            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></div>
                                            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                                        </div>
                                    </Button>
                                </div>

                                {/* Mobile menu button with animation */}
                                <button
                                    type="button"
                                    className="md:hidden p-2 rounded-lg text-gray-700 hover:text-black hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-all duration-200 flex items-center justify-center"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Menu Dropdown */}
                    <div className={`absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-200 transition-all duration-500 ease-in-out z-40 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'} overflow-hidden`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {/* Navigation Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Navigation</h3>
                                    <div className="space-y-2">
                                        <Link href="/dashboard/client" className="flex cursor-pointer items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                                            <Folder className="h-4 w-4" />
                                            <span>Files</span>
                                        </Link>
                                        <Link href="/dashboard/client/meeting" className="flex cursor-pointer items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                                            <MessageCircle className="h-4 w-4" />
                                            <span>Meetings</span>
                                        </Link>
                                        <Link href="/dashboard/client/analytics" className="flex cursor-pointer items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                                            <BarChart3 className="h-4 w-4" />
                                            <span>Analytics</span>
                                        </Link>
                                        <Link href="/dashboard/client/formats" className="flex cursor-pointer items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                                            <FileText className="h-4 w-4" />
                                            <span>Formatos</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Formats Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Formats</h3>
                                    <div className="space-y-2">
                                        <button className="flex  items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Camera className="h-4 w-4" />
                                            <span>Imagen/Video Único</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Film className="h-4 w-4" />
                                            <span>Secuencia</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Presentation className="h-4 w-4" />
                                            <span>Slideshow</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <BookOpen className="h-4 w-4" />
                                            <span>Catalogue</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <ThumbsUp className="h-4 w-4" />
                                            <span>Reels</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Creative Types Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Tipos de creativos</h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Package className="h-4 w-4" />
                                            <span>Unboxing</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Star className="h-4 w-4" />
                                            <span>Aspirational Product</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Award className="h-4 w-4" />
                                            <span>Aspirational Brand</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Shirt className="h-4 w-4" />
                                            <span>Get the look</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Newspaper className="h-4 w-4" />
                                            <span>PRESS</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <ImageDownIcon className="h-4 w-4" />
                                            <span>Product (Flatlays)</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>Testimonials</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Play className="h-4 w-4" />
                                            <span>Product Demonstration</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <List className="h-4 w-4" />
                                            <span>Enumeración de funciones</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Megaphone className="h-4 w-4" />
                                            <span>Promotion</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Scale className="h-4 w-4" />
                                            <span>Comparative</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <GraduationCap className="h-4 w-4" />
                                            <span>Educational</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Users className="h-4 w-4" />
                                            <span>Human</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Target className="h-4 w-4" />
                                            <span>Diferenciales</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Video className="h-4 w-4" />
                                            <span>Product Demo</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <RotateCcw className="h-4 w-4" />
                                            <span>Before & After</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>Statistics Based</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <HelpCircle className="h-4 w-4" />
                                            <span>TikTok Answer</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <UserCheck className="h-4 w-4" />
                                            <span>Founder Style</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <StickyNote className="h-4 w-4" />
                                            <span>Post-it</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Star className="h-4 w-4" />
                                            <span>Review Based</span>
                                        </button>
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <PlayCircle className="h-4 w-4" />
                                            <span>Tutorial TikTok Style</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Approaches & Angles Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Enfoques & Ángulos</h3>
                                    <div className="space-y-2">
                                        <button className="flex items-center space-x-3 text-gray-700 hover:text-[#E84912] hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 w-full text-left">
                                            <Shuffle className="h-4 w-4" />
                                            <span>Cross sells</span>
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
                        className="hidden lg:flex lg:w-20 lg:hover:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 lg:bg-gradient-to-b lg:from-slate-100 lg:to-white lg:border-r-1 lg:border-slate-500 lg:shadow-xl lg:transition-all lg:duration-300 lg:ease-in-out group"
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                    >
                        <div className="flex-1 flex flex-col min-h-0 py-4">
                            {/* Folders section header */}
                            <div className={`px-3 mb-3 transition-opacity duration-300 ${sidebarHovered ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Folders ({folders.length})
                                    </span>
                                    <button
                                        onClick={fetchFolders}
                                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                                        title="Refresh folders"
                                    >
                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable navigation container */}
                            <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                                <nav className="px-3 space-y-2">
                                    {loadingFolders ? (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E84912]"></div>
                                        </div>
                                    ) : (
                                        sidebarNavigation.map((item, index) => {
                                            const isActive =
                                                (item.name === "All Folders" && !currentFolder) ||
                                                (item.name !== "All Folders" && currentFolder === item.name);

                                            const IconComponent = item.icon;
                                            const itemColor = item.isSpecial
                                                ? "#E84912"
                                                : junoColors[index % junoColors.length];

                                            return (
                                                <button
                                                    key={item.name}
                                                    onClick={() => {
                                                        if (item.name === "All Files") {
                                                            router.push("/dashboard/client");
                                                        } else {
                                                            handleFolderClick(item.name, item.folderId);
                                                        }
                                                    }}
                                                    className={`w-full group/item relative flex items-center p-2.5 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${isActive
                                                        ? 'text-black bg-black/10 shadow-lg'
                                                        : 'text-gray-700 hover:text-black hover:bg-black/5 hover:shadow-md'
                                                        }`}
                                                    style={{
                                                        border: isActive ? `2px solid ${itemColor}` : '2px solid transparent',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.backgroundColor = itemColor + '10';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.backgroundColor = '';
                                                        }
                                                    }}
                                                    title={item.name}
                                                >
                                                    {/* Active indicator */}
                                                    {isActive && (
                                                        <div
                                                            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-r-full"
                                                            style={{ backgroundColor: itemColor }}
                                                        ></div>
                                                    )}

                                                    {/* Icon with background circle */}
                                                    <div
                                                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isActive ? 'bg-black/10' : 'bg-slate-200 group-hover/item:bg-black/5'
                                                            }`}
                                                        style={{
                                                            backgroundColor: !isActive
                                                                ? itemColor + '10'
                                                                : undefined,
                                                        }}
                                                    >
                                                        <IconComponent
                                                            className={`h-4 w-4 transition-colors ${isActive ? 'text-black' : 'group-hover/item:text-black'
                                                                }`}
                                                            style={{
                                                                color: !isActive ? itemColor : undefined,
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Expandable text */}
                                                    <div
                                                        className={`ml-2.5 flex-1 min-w-0 transition-opacity duration-300 overflow-hidden ${sidebarHovered ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className={`text-sm font-medium whitespace-nowrap block leading-tight ${isActive
                                                                    ? 'text-black font-semibold'
                                                                    : 'text-gray-700 group-hover/item:text-black'
                                                                    }`}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            {/* Item count for folders */}
                                                            {item.itemCount !== undefined && (
                                                                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                                                                    {item.itemCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Hover tooltip for collapsed state */}
                                                    <div
                                                        className={`absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg ${sidebarHovered
                                                            ? 'opacity-0'
                                                            : 'opacity-0 group-hover/item:opacity-100'
                                                            }`}
                                                    >
                                                        {item.name}
                                                        {item.itemCount !== undefined && (
                                                            <span className="text-gray-300"> ({item.itemCount} items)</span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </nav>
                            </div>

                            {/* Bottom Profile and Logout Section */}
                            <div className="border-t border-gray-200 pt-4 px-3">
                                {/* Profile section */}
                                <div className="mb-3">
                                    <div
                                        className={`w-full flex items-center transition-all duration-300 border border-gray-200 hover:border-[#E84912]/20 shadow-sm hover:shadow-md cursor-pointer ${sidebarHovered
                                            ? 'gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#E84912]/5 hover:to-[#E84912]/10'
                                            : 'justify-center p-4 rounded-lg bg-gray-50 hover:bg-[#E84912]/5'
                                            }`}
                                        onClick={() => setShowProfileDialog(true)}
                                    >
                                        {/* Profile Avatar - Always visible */}
                                        <div className="relative flex-shrink-0">
                                            <Avatar className={`ring-2 ring-white shadow-lg hover:ring-[#E84912] transition-all duration-300 ${sidebarHovered ? 'h-10 w-10' : 'h-8 w-8'
                                                }`}>
                                                <AvatarImage
                                                    src={user?.profile_image ? `/api/dashboard/client/user/profile-image` : "/profile.jpg"}
                                                    alt={user?.name || "User"}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-[#E84912] to-[#d63d0e] text-white font-semibold">
                                                    {user?.name
                                                        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
                                                        : <User className="h-4 w-4 text-white" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            {/* Online status indicator */}
                                            <div className={`absolute bg-green-400 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${sidebarHovered
                                                ? '-bottom-0.5 -right-0.5 w-3 h-3'
                                                : '-bottom-0.5 -right-0.5 w-2.5 h-2.5'
                                                }`}></div>
                                        </div>

                                        {/* Text content and settings - Only visible when expanded */}
                                        {sidebarHovered && (
                                            <>
                                                {/* Text content */}
                                                <div className="flex-1 min-w-0 transition-all duration-300 opacity-100 translate-x-0">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 text-sm font-semibold truncate leading-tight">
                                                            {user?.name || "Loading..."}
                                                        </span>
                                                        <span className="text-gray-600 text-xs truncate mt-0.5">
                                                            {user?.role || "Client User"}
                                                        </span>
                                                        {/* Status badge */}
                                                        <div className="mt-1">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                                                                Online
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Settings icon */}
                                                <div className="transition-all duration-300 opacity-100 translate-x-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowProfileDialog(true);
                                                        }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#E84912] hover:bg-[#E84912]/10 transition-all duration-200"
                                                        title="Change Profile Picture"
                                                    >
                                                        <Settings className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* Tooltip for collapsed state */}
                                        {!sidebarHovered && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg opacity-0 group-hover:opacity-100">
                                                {user?.name || "Profile"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Logout button */}
                                <button
                                    onClick={handleLogout}
                                    className={`w-full group/logout py-4 px-2 cursor-pointer flex items-center rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 relative ${sidebarHovered ? 'gap-2 p-2' : 'justify-center p-2'
                                        }`}
                                    title="Sign out"
                                >
                                    <LogOut className="h-4 w-4 group-hover/logout:text-red-600 flex-shrink-0" />

                                    {/* Sign out text - Only visible when expanded */}
                                    {sidebarHovered && (
                                        <span className="text-sm font-medium group-hover/logout:text-red-600 transition-all duration-300">
                                            Sign out
                                        </span>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {!sidebarHovered && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg opacity-0 group-hover/logout:opacity-100">
                                            Sign out
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile sidebar */}
                    <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
                        <div
                            className={`fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity ease-linear duration-300 backdrop-blur-sm ${sidebarOpen ? 'opacity-100' : 'opacity-0'
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        />

                        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-gray-900 to-black transform transition ease-in-out duration-300 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}>
                            {/* Close button */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    type="button"
                                    className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-colors"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <X className="h-5 w-5 text-gray-300" />
                                </button>
                            </div>

                            {/* Mobile sidebar header */}
                            <div className="pt-8 pb-4 px-4 border-b border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-gradient-to-br from-[#E84912] to-[#d63d0e] rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">J</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white">JUNO</h2>
                                </div>
                            </div>

                            <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
                                <nav className="px-4 space-y-2">
                                    {loadingFolders ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E84912]"></div>
                                        </div>
                                    ) : (
                                        sidebarNavigation.map((item, index) => {
                                            const isActive =
                                                (item.name === "All Files" && !currentFolder) ||
                                                (item.name !== "All Files" && currentFolder === item.name);

                                            const IconComponent = item.icon;
                                            const itemColor = item.isSpecial
                                                ? "#E84912"
                                                : junoColors[index % junoColors.length];

                                            return (
                                                <button
                                                    key={item.name}
                                                    onClick={() => {
                                                        if (item.name === "All Files") {
                                                            router.push("/dashboard/client");
                                                        } else {
                                                            handleFolderClick(item.name, item.folderId);
                                                        }
                                                    }}
                                                    className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                                        ? 'text-white shadow-lg'
                                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:shadow-md'
                                                        }`}
                                                    style={{
                                                        backgroundColor: isActive ? itemColor : undefined
                                                    }}
                                                >
                                                    <div
                                                        className={`p-2 rounded-lg mr-3 transition-colors ${isActive
                                                            ? 'bg-white/20'
                                                            : 'bg-gray-800 group-hover:bg-gray-700'
                                                            }`}
                                                        style={{
                                                            backgroundColor: !isActive
                                                                ? itemColor + '15'
                                                                : undefined
                                                        }}
                                                    >
                                                        <IconComponent
                                                            className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-white'
                                                                }`}
                                                            style={{
                                                                color: !isActive ? itemColor : undefined
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between flex-1">
                                                        <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                                            }`}>
                                                            {item.name}
                                                        </span>
                                                        {item.itemCount !== undefined && (
                                                            <span className="ml-2 text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                                                                {item.itemCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </nav>

                                {/* Mobile logout button */}
                                <div className="px-4 mt-8 pt-4 border-t border-gray-700">
                                    <button
                                        onClick={handleLogout}
                                        className="group flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-red-900/50 hover:text-red-400 transition-all duration-200 w-full border border-transparent hover:border-red-700"
                                    >
                                        <div className="p-2 rounded-lg mr-3 bg-gray-800 group-hover:bg-red-900/50 transition-colors">
                                            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400" />
                                        </div>
                                        <span className="font-medium group-hover:font-semibold">Sign out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content with responsive padding */}
                    <main
                        className={`flex-1 transition-all duration-300 ease-in-out ${sidebarHovered ? 'lg:pl-64' : 'lg:pl-20'
                            }`}
                    >
                        <div className="min-h-screen tracking-tight">
                            <Suspense>{children}</Suspense>
                        </div>
                    </main>
                </div>

                {/* Profile Upload Dialog */}
                <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload a Profile Picture</DialogTitle>
                            <DialogDescription>
                                You don&apos;t have a profile image yet. Would you like to upload one? (Optional)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 mt-4">
                            <DndContext onDragEnd={handleDragEnd}>
                                <ProfileDropZone>
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-full shadow-lg border-4 border-white mb-2"
                                        />
                                    ) : (
                                        <>
                                            <User className="w-10 h-10 text-[#E84912] mb-2" />
                                            <span className="text-sm text-gray-700 font-medium mb-1">Drag & drop your image here</span>
                                            <span className="text-xs text-gray-500">or</span>
                                            <button
                                                type="button"
                                                className="mt-2 px-4 py-2 rounded bg-[#E84912] text-white hover:bg-[#d63d0e] font-medium"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                Browse
                                            </button>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file && file.type.startsWith("image/")) {
                                                setPreview(URL.createObjectURL(file));
                                                setSelectedFile(file);
                                            }
                                        }}
                                    />
                                </ProfileDropZone>
                            </DndContext>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-medium">
                                        Skip
                                    </button>
                                </DialogClose>
                                <button
                                    className="px-4 py-2 rounded bg-[#E84912] text-white hover:bg-[#d63d0e] font-medium"
                                    disabled={!selectedFile}
                                    onClick={handleUpload}
                                >
                                    Upload
                                </button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}