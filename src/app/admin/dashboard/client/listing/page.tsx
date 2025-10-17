"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ROLES = [
    { value: "all", label: "All Roles" },
    { value: "client", label: "Client" },
    { value: "admin", label: "Admin" },
    { value: "member", label: "Member" },
];

export default function ClientListingPage() {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;

    useEffect(() => {
        async function fetchClients() {
            const res = await fetch("/api/admin/dashboard/client/listing");
            const data = await res.json();
            setClients(data.clients || []);
            setLoading(false);
        }
        fetchClients();
    }, []);

    useEffect(() => {
        let filtered = clients;
        if (search) {
            filtered = filtered.filter((client: any) =>
                (client.name || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (client.comp_email || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                (client.cli_email || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }
        if (roleFilter !== "all") {
            filtered = filtered.filter((client: any) => client.role === roleFilter);
        }
        setFilteredClients(filtered);
        setPage(1); // Reset to first page on filter/search change
    }, [clients, search, roleFilter]);

    const getInitials = (name: string) => {
        if (!name) return "C";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Handle status change
    const handleStatusChange = async (clientId: string, newStatus: string) => {
        setClients((prev: any) =>
            prev.map((client: any) =>
                client.id === clientId ? { ...client, status: newStatus } : client
            )
        );
        await fetch(`/api/admin/dashboard/client/listing`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: clientId, status: newStatus }),
        });
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
    const paginatedClients = filteredClients.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-lg font-medium text-gray-600">Loading clients...</p>
            </div>
        );
    }

    return (
        <div className="px-20 mx-auto py-10">
            <h1 className="text-4xl font-extrabold mb-8 text-left text-[#E84912] tracking-tight">
                Clients List
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full"
                    />
                    <Select
                        value={roleFilter}
                        onValueChange={setRoleFilter}
                    >
                        <SelectTrigger className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ROLES.map(role => (
                                <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Link
                    href="/admin/dashboard/client/create"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E84912] hover:bg-[#F6A100] text-white font-bold shadow-lg transition-all duration-200 text-base"
                >
                    <span className="text-xl">+</span>
                    Add New Client
                </Link>
            </div>
            <div className="overflow-x-auto rounded-2xl shadow-2xl bg-gradient-to-br from-[#fff7f2] via-[#f8fafc] to-[#f0fdf4] border border-[#F6A100]/20">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gradient-to-r from-[#E84912]/20 via-[#F97316]/10 to-[#438D34]/20">
                            <TableHead className="px-6 py-4 text-[#E84912] uppercase tracking-wider text-base font-bold">Avatar</TableHead>
                            <TableHead className="px-6 py-4 text-[#E84912] uppercase tracking-wider text-base font-bold">Name</TableHead>
                            <TableHead className="px-6 py-4 text-[#E84912] uppercase tracking-wider text-base font-bold">Email</TableHead>
                            <TableHead className="px-6 py-4 text-[#E84912] uppercase tracking-wider text-base font-bold">Client Email</TableHead>
                            <TableHead className="px-6 py-4 text-[#438D34] uppercase tracking-wider text-base font-bold">Role</TableHead>
                            <TableHead className="px-6 py-4 text-[#EA6D51] uppercase tracking-wider text-base font-bold">Joined</TableHead>
                            <TableHead className="px-6 py-4 text-[#3669B2] uppercase tracking-wider text-base font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-400 text-lg">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl">🧐</span>
                                        No clients found.
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedClients.map((client: any) => {
                                const hasImage = !!client.profile_image;
                                return (
                                    <TableRow
                                        key={client.id}
                                        className="hover:bg-gradient-to-r hover:from-[#fff7f2] hover:via-[#f8fafc] hover:to-[#f0fdf4] transition-all duration-200 group"
                                    >
                                        <TableCell className="px-6 py-4">
                                            {hasImage ? (
                                                <div className="relative w-12 h-12">
                                                    <Image
                                                        src={client.profile_image}
                                                        alt={client.name || "Client"}
                                                        width={48}
                                                        height={48}
                                                        className="rounded-full border-2 border-[#E84912]/40 object-cover shadow-md group-hover:scale-105 transition-transform"
                                                    />
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                            bg-green-400 shadow-md animate-pulse"></span>
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E84912]/80 via-[#F97316]/80 to-[#438D34]/80 text-white text-lg font-bold border-2 border-[#E84912]/30 shadow-md group-hover:scale-105 transition-transform">
                                                    {getInitials(client.name)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 font-semibold text-gray-800 group-hover:text-[#E84912] transition-colors">
                                            {client.name || "Unnamed Client"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 group-hover:text-[#F6A100] transition-colors">
                                            {client.comp_email || "N/A"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 group-hover:text-[#438D34] transition-colors">
                                            {client.cli_email || "N/A"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-[#438D34]/10 text-[#438D34] text-xs font-semibold shadow-sm border border-[#438D34]/20">
                                                {client.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-xs text-gray-400 group-hover:text-[#EA6D51] transition-colors">
                                            {client.created_at ? new Date(client.created_at).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Select
                                                value={client.status || "active"}
                                                onValueChange={value => handleStatusChange(client.id, value)}
                                            >
                                                <SelectTrigger
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer shadow-sm transition-all duration-200 w-28
                                                            ${client.status === "inactive"
                                                            ? "bg-red-100 text-red-600 border-red-200 hover:bg-red-200"
                                                            : "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                                        }`}
                                                    size="sm"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">
                                                        <span className="flex items-center gap-2">
                                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                                            Active
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        <span className="flex items-center gap-2">
                                                            <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                                            Inactive
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 rounded-lg bg-[#F6A100] text-white font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage(idx + 1)}
                            className={`px-3 py-1 rounded-lg font-bold shadow transition-all ${page === idx + 1
                                    ? "bg-[#E84912] text-white"
                                    : "bg-white text-[#E84912] border border-[#E84912]/30"
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded-lg bg-[#F6A100] text-white font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}