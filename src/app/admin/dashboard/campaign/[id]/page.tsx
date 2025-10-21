"use client";

import { useParams } from "next/navigation";
import { BarChart3, TrendingUp, TrendingDown, Users, Package, FileText } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

// Example static campaign data (should match IDs from dashboard)
const campaigns = [
  {
    id: "1",
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
    metrics: [
      { label: "CTR", value: "63.5%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Open Rate", value: "87.7%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Bounce Rate", value: "2.1%", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
      { label: "Unsubscribed", value: "12", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
    ],
  },
  {
    id: "2",
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
    metrics: [
      { label: "CTR", value: "39.2%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Open Rate", value: "80.1%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Bounce Rate", value: "3.5%", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
      { label: "Unsubscribed", value: "25", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
    ],
  },
  {
    id: "3",
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
    metrics: [
      { label: "CTR", value: "56.3%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Open Rate", value: "88.9%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Bounce Rate", value: "1.8%", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
      { label: "Unsubscribed", value: "8", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
    ],
  },
  {
    id: "4",
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
    metrics: [
      { label: "CTR", value: "50.0%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Open Rate", value: "87.5%", icon: <TrendingUp className="w-4 h-4 text-green-600" /> },
      { label: "Bounce Rate", value: "0.5%", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
      { label: "Unsubscribed", value: "2", icon: <TrendingDown className="w-4 h-4 text-red-600" /> },
    ],
  },
];

const engagementData = [
  { day: "Mon", clicks: 120, opens: 300 },
  { day: "Tue", clicks: 150, opens: 320 },
  { day: "Wed", clicks: 180, opens: 400 },
  { day: "Thu", clicks: 170, opens: 390 },
  { day: "Fri", clicks: 200, opens: 420 },
  { day: "Sat", clicks: 90, opens: 210 },
  { day: "Sun", clicks: 60, opens: 150 },
];

const conversionPie = [
  { name: "Converted", value: 234, color: "#53B36A" },
  { name: "Clicked", value: 1205, color: "#3669B2" },
  { name: "Opened", value: 1890, color: "#F6A100" },
  { name: "Delivered", value: 2156, color: "#E84912" },
];

export default function CampaignDetailPage() {
  const params = useParams();
  const campaign = campaigns.find(c => c.id === params.id);

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-[#E84912] mb-2">Campaign Not Found</h2>
          <p className="text-gray-600">No campaign data available for this ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="px-20 mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
            <p className="text-gray-500 mt-2">{campaign.description}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {campaign.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border
              ${campaign.statusColor === "green" && "bg-green-50 text-green-700 border-green-200"}
              ${campaign.statusColor === "yellow" && "bg-yellow-50 text-yellow-700 border-yellow-200"}
              ${campaign.statusColor === "blue" && "bg-blue-50 text-blue-700 border-blue-200"}
            `}
          >
            {campaign.status}
          </span>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(campaign.stats).map(([label, value]) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-center">
              {label === "Delivered" && <Users className="w-5 h-5 text-[#E84912] mb-2" />}
              {label === "Opened" && <Package className="w-5 h-5 text-[#53B36A] mb-2" />}
              {label === "Clicked" && <FileText className="w-5 h-5 text-[#3669B2] mb-2" />}
              {label === "Converted" && <BarChart3 className="w-5 h-5 text-[#F6A100] mb-2" />}
              <span className="text-xs text-gray-500">{label}</span>
              <span className="font-bold text-xl text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Looker Studio Style Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {campaign.metrics.map((metric, idx) => (
            <div
              key={idx}
              className="relative bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all"
              style={{
                minHeight: "140px",
                boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
                borderTop: `4px solid ${metric.icon.props.className.includes('text-green-600') ? '#53B36A' : '#E84912'}`
              }}
            >
              <div className="absolute top-4 right-4 opacity-30">
                {metric.icon}
              </div>
              <span className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{metric.label}</span>
              <span className="font-extrabold text-3xl text-gray-900 mb-1">{metric.value}</span>
              <div className="flex items-center gap-1 mt-2">
                {metric.icon}
                <span className={`text-sm font-medium ${metric.icon.props.className.includes('text-green-600') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.label === "CTR" || metric.label === "Open Rate" ? "Positive" : "Negative"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Engagement Area Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E84912]" />
              Engagement Over Time
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
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
                  dataKey="opens"
                  stroke="#53B36A"
                  fill="#53B36A"
                  fillOpacity={0.2}
                  name="Opens"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#E84912"
                  fill="#E84912"
                  fillOpacity={0.2}
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Pie Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#53B36A]" />
              Conversion Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPieChart>
                <Pie
                  data={conversionPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conversionPie.map((entry, index) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}