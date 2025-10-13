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
import { LineChart, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts";

const COLORS = ['#E84912', '#F6A100', '#53B36A', '#3669B2', '#67ACAA', '#D7770F', '#438D34', '#64C2C6', '#2953A1', '#719AD1'];

// Mock data for charts
const userGrowthData = [
    { month: 'Jan', users: 1200, active: 980 },
    { month: 'Feb', users: 1350, active: 1100 },
    { month: 'Mar', users: 1580, active: 1300 },
    { month: 'Apr', users: 1720, active: 1450 },
    { month: 'May', users: 1890, active: 1600 },
    { month: 'Jun', users: 2100, active: 1800 },
];

const systemPerformanceData = [
    { time: '00:00', cpu: 45, memory: 62, disk: 78 },
    { time: '04:00', cpu: 52, memory: 58, disk: 79 },
    { time: '08:00', cpu: 78, memory: 74, disk: 81 },
    { time: '12:00', cpu: 85, memory: 82, disk: 83 },
    { time: '16:00', cpu: 72, memory: 76, disk: 84 },
    { time: '20:00', cpu: 65, memory: 68, disk: 85 },
];

const projectStatusData = [
    { name: 'Active', value: 45, color: '#53B36A' },
    { name: 'Pending', value: 23, color: '#F6A100' },
    { name: 'Completed', value: 78, color: '#3669B2' },
    { name: 'On Hold', value: 12, color: '#E84912' },
];

const recentActivities = [
    { id: 1, type: 'user', action: 'New user registered', user: 'John Doe', time: '2 minutes ago', severity: 'info' },
    { id: 2, type: 'security', action: 'Failed login attempt detected', user: 'admin@example.com', time: '5 minutes ago', severity: 'warning' },
    { id: 3, type: 'system', action: 'Database backup completed', user: 'System', time: '15 minutes ago', severity: 'success' },
    { id: 4, type: 'project', action: 'Project "Website Redesign" updated', user: 'Jane Smith', time: '1 hour ago', severity: 'info' },
    { id: 5, type: 'user', action: 'User permissions modified', user: 'Mike Johnson', time: '2 hours ago', severity: 'warning' },
];

const topClients = [
    { name: 'Acme Corp', projects: 15, revenue: '$125,000', growth: '+12%', avatar: '/client1.jpg' },
    { name: 'TechStart Inc', projects: 8, revenue: '$89,000', growth: '+8%', avatar: '/client2.jpg' },
    { name: 'Global Solutions', projects: 12, revenue: '$156,000', growth: '+15%', avatar: '/client3.jpg' },
    { name: 'Digital Agency', projects: 6, revenue: '$67,000', growth: '+5%', avatar: '/client4.jpg' },
];

export default function AdminDashboard() {
    const [systemStatus, setSystemStatus] = useState('healthy');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

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
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600">
                            Welcome back! Here's what's happening with your system today.
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

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-[#E84912]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">2,156</div>
                            <div className="flex items-center text-xs text-green-600 mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +12.5% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
                            <UserCheck className="h-4 w-4 text-[#F6A100]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">89</div>
                            <div className="flex items-center text-xs text-green-600 mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +8.2% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
                            <Package className="h-4 w-4 text-[#53B36A]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">234</div>
                            <div className="flex items-center text-xs text-red-600 mt-1">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                -2.1% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Documents</CardTitle>
                            <FileText className="h-4 w-4 text-[#3669B2]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">1,205</div>
                            <div className="flex items-center text-xs text-green-600 mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +15.3% from last month
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Status */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                            <Server className="h-5 w-5 text-[#E84912]" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Cpu className="h-5 w-5 text-blue-500" />
                                    <span className="text-gray-700">CPU Usage</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-900 font-semibold">72%</div>
                                    <Progress value={72} className="w-16 h-2 mt-1" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Monitor className="h-5 w-5 text-green-500" />
                                    <span className="text-gray-700">Memory</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-900 font-semibold">68%</div>
                                    <Progress value={68} className="w-16 h-2 mt-1" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <HardDrive className="h-5 w-5 text-yellow-500" />
                                    <span className="text-gray-700">Disk Space</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-900 font-semibold">85%</div>
                                    <Progress value={85} className="w-16 h-2 mt-1" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Wifi className="h-5 w-5 text-purple-500" />
                                    <span className="text-gray-700">Network</span>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                                        Healthy
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Growth Chart */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-[#E84912]" />
                                User Growth
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stackId="1"
                                        stroke="#E84912"
                                        fill="#E84912"
                                        fillOpacity={0.3}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="active"
                                        stackId="2"
                                        stroke="#53B36A"
                                        fill="#53B36A"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Project Status Distribution */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-[#F6A100]" />
                                Project Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={projectStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {projectStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity and Top Clients */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-[#67ACAA]" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.severity === 'success' ? 'bg-green-500' :
                                                activity.severity === 'warning' ? 'bg-yellow-500' :
                                                    'bg-blue-500'
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-gray-500 text-xs">{activity.user}</span>
                                                <span className="text-gray-400 text-xs">•</span>
                                                <span className="text-gray-500 text-xs">{activity.time}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${activity.severity === 'success' ? 'text-green-600 border-green-600 bg-green-50' :
                                                    activity.severity === 'warning' ? 'text-yellow-600 border-yellow-600 bg-yellow-50' :
                                                        'text-blue-600 border-blue-600 bg-blue-50'
                                                }`}
                                        >
                                            {activity.type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Clients */}
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-gray-900 flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-[#3669B2]" />
                                Top Clients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topClients.map((client, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={client.avatar} alt={client.name} />
                                            <AvatarFallback className="bg-[#E84912] text-white">
                                                {client.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-medium">{client.name}</p>
                                            <p className="text-gray-500 text-sm">{client.projects} projects</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-900 font-semibold">{client.revenue}</p>
                                            <p className="text-green-600 text-sm">{client.growth}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Performance Chart */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-[#719AD1]" />
                            System Performance (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={systemPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="time" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cpu"
                                    stroke="#E84912"
                                    strokeWidth={2}
                                    name="CPU %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="memory"
                                    stroke="#53B36A"
                                    strokeWidth={2}
                                    name="Memory %"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="disk"
                                    stroke="#3669B2"
                                    strokeWidth={2}
                                    name="Disk %"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}