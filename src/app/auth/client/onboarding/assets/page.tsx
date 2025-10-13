"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, FolderOpen, FileText, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Tree, Folder, File, type TreeViewElement } from "@/components/ui/file-tree";
import Loader from "@/components/kokonutui/loader";

type LocalFile = {
    id: string;
    name: string;
    file: File;
    parentId: string | null;
    type: "file";
    path: string; // relative path from root
};

type LocalFolder = {
    id: string;
    name: string;
    parentId: string | null;
    type: "folder";
    children: (LocalFile | LocalFolder)[];
    path: string; // relative path from root
};

function getLocalFiles(): (LocalFile | LocalFolder)[] {
    try {
        const data = localStorage.getItem("creatives_upload");
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function setLocalFiles(files: (LocalFile | LocalFolder)[]) {
    localStorage.setItem("creatives_upload", JSON.stringify(files));
}

// Recursively parse dropped items (files & folders)
async function parseItems(items: DataTransferItemList): Promise<(LocalFile | LocalFolder)[]> {
    const result: (LocalFile | LocalFolder)[] = [];

    async function traverseFileTree(item: any, parentId: string | null, parentPath: string): Promise<any> {
        if (item.isFile) {
            await new Promise<void>((resolve) => {
                item.file((file: File) => {
                    result.push({
                        id: crypto.randomUUID(),
                        name: file.name,
                        file,
                        parentId,
                        type: "file",
                        path: parentPath ? `${parentPath}/${file.name}` : file.name,
                    });
                    resolve();
                });
            });
        } else if (item.isDirectory) {
            const folderId = crypto.randomUUID();
            const reader = item.createReader();
            const children: (LocalFile | LocalFolder)[] = [];
            await new Promise<void>((resolve) => {
                function readEntries() {
                    reader.readEntries(async (entries: any[]) => {
                        if (!entries.length) {
                            result.push({
                                id: folderId,
                                name: item.name,
                                parentId,
                                type: "folder",
                                children,
                                path: parentPath ? `${parentPath}/${item.name}` : item.name,
                            });
                            resolve();
                        } else {
                            for (const entry of entries) {
                                await traverseFileTree(entry, folderId, parentPath ? `${parentPath}/${item.name}` : item.name);
                            }
                            readEntries();
                        }
                    });
                }
                readEntries();
            });
        }
    }

    for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) await traverseFileTree(entry, null, "");
    }
    return result;
}

export default function CreativesUploadPage() {
    const [creativesFolderId, setCreativesFolderId] = useState<string | null>(null);
    const [treeData, setTreeData] = useState<(LocalFile | LocalFolder)[]>(getLocalFiles());
    const [uploading, setUploading] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const [showSplash, setShowSplash] = useState(true);
    const [clientName, setClientName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch the "Creatives" folder for the current user
    useEffect(() => {
        async function fetchCreativesFolder() {
            try {
                const res = await fetch("/api/dashboard/client/assets");
                const folders = await res.json();
                const creatives = folders.find(
                    (f: any) => f.type === "folder" && f.name === "Creatives"
                );
                if (creatives) setCreativesFolderId(creatives.id);
            } catch (err) {
                toast.error("Failed to fetch Creatives folder.");
            }
        }
        fetchCreativesFolder();
    }, []);

    // Load local files on mount
    useEffect(() => {
        setTreeData(getLocalFiles());
    }, []);

    useEffect(() => {
        async function fetchClientName() {
            // Example: fetch from profile API
            try {
                const res = await fetch("/api/dashboard/client");
                const data = await res.json();
                setClientName(data.name || "Client");
            } catch {
                setClientName("Client");
            }
            // Simulate loading effect
            setTimeout(() => setShowSplash(false), 1800);
        }
        fetchClientName();
    }, []);

    // Handle file/folder drop (supports folders)
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        let newItems: (LocalFile | LocalFolder)[] = [];
        if (
            e.dataTransfer.items &&
            e.dataTransfer.items.length > 0 &&
            e.dataTransfer.items[0].webkitGetAsEntry()
        ) {
            newItems = await parseItems(e.dataTransfer.items);
        } else {
            const files = Array.from(e.dataTransfer.files);
            newItems = files.map((file) => ({
                id: crypto.randomUUID(),
                name: file.name,
                file,
                parentId: null,
                type: "file",
                path: file.name,
            }));
        }

        const updatedTree = [...treeData, ...newItems];
        setTreeData(updatedTree);
        setLocalFiles(updatedTree);

        toast.success(`${newItems.length} item(s) added to queue`);
    };

    // Prevent default drag events
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // Recursively upload files, preserving folder structure
    async function uploadRecursive(items: (LocalFile | LocalFolder)[], parentPath: string) {
        for (const item of items) {
            if (item.type === "file") {
                const formData = new FormData();
                formData.append("file", item.file);
                formData.append("parent_id", creativesFolderId!);
                formData.append("folder_path", item.path); // Send relative path

                await fetch("/api/client/onboarding/creatives/upload", {
                    method: "POST",
                    body: formData,
                });
            } else if (item.type === "folder") {
                await uploadRecursive(item.children, item.path);
            }
        }
    }

    // Final submit handler: upload all files in localStorage to Supabase, preserving folder structure
    const handleFinalSubmit = async () => {
        if (!creativesFolderId) return toast.error("Creatives folder not found.");
        setUploading(true);

        await uploadRecursive(treeData, "");

        setUploading(false);
        setLocalFiles([]);
        setTreeData([]);
        toast.success(`Uploaded all files! Redirecting...`);
        setTimeout(() => {
            window.location.href = "/dashboard/client";
        }, 1500);
    };

    // Skip handler
    const handleSkip = () => {
        setLocalFiles([]);
        setTreeData([]);
        window.location.href = "/dashboard/client";
    };

    function buildNestedTree(flat: (LocalFile | LocalFolder)[]): TreeViewElement[] {
        const map: Record<string, TreeViewElement & { children?: TreeViewElement[] }> = {};
        const roots: TreeViewElement[] = [];

        // Initialize map
        flat.forEach(item => {
            map[item.id] = {
                id: item.id,
                name: item.name,
                ...(item.type === "folder" ? { children: [] } : {}),
            };
        });

        // Assign children based on parentId
        flat.forEach(item => {
            if (item.parentId && map[item.parentId]) {
                if (!map[item.parentId].children) map[item.parentId].children = [];
                map[item.parentId].children!.push(map[item.id]);
            } else if (!item.parentId) {
                roots.push(map[item.id]);
            }
        });

        return roots;
    }

    function handleRemove(id: string) {
        // Recursively remove item and its children from treeData
        function removeRecursive(items: (LocalFile | LocalFolder)[], targetId: string): (LocalFile | LocalFolder)[] {
            return items
                .filter(item => item.id !== targetId)
                .map(item => {
                    if (item.type === "folder" && item.children) {
                        return {
                            ...item,
                            children: removeRecursive(item.children, targetId),
                        };
                    }
                    return item;
                });
        }

        const updated = removeRecursive(treeData, id);
        setTreeData(updated);
        setLocalFiles(updated);
    }

    function renderTree(elements: TreeViewElement[]) {
        return elements.map((el) =>
            el.children && el.children.length > 0 ? (
                <Folder key={el.id} value={el.id} element={el.name}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{el.name}</span>
                        <button
                            className="ml-2 text-xs text-red-500 hover:underline"
                            onClick={() => handleRemove(el.id)}
                            type="button"
                        >
                            Remove
                        </button>
                    </div>
                    {renderTree(el.children)}
                </Folder>
            ) : (
                <File key={el.id} value={el.id}>
                    <span>
                        {el.name}
                        <span
                            className="ml-2 text-xs text-red-500 hover:underline cursor-pointer"
                            onClick={() => handleRemove(el.id)}
                        >
                            Remove
                        </span>
                    </span>
                </File>
            )
        );
    }

    if (showSplash) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E84912]/10 via-white to-[#438D34]/10">
                <Loader
                    title={`Before we finish some changes for ${clientName}...`}
                    subtitle="Please wait while we prepare everything for you"
                    size="md"
                />
            </div>
        );
    }

    if (uploading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#E84912]/20 via-white to-[#438D34]/20">
                <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-6 border border-orange-100">
                    <div className="flex items-center gap-4">
                        <CloudUpload size={56} className="text-[#F97316] animate-pulse drop-shadow" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#E84912] text-center flex items-center gap-2">
                        Uploading your assets...
                    </h2>
                    <span className="text-gray-600 text-center mb-2">
                        Please wait while we securely upload your files and folders.<br />
                        <span className="text-xs text-[#EA6D51]">Do not close this window.</span>
                    </span>
                    <div className="w-64 h-3 bg-orange-100 rounded-full overflow-hidden shadow">
                        <div className="h-full bg-gradient-to-r from-[#E84912] via-[#F97316] to-[#EA6D51] animate-upload-progress" style={{ width: "80%" }} />
                    </div>
                    <span className="text-[#E84912] font-semibold animate-pulse mt-2">Uploading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E84912]/10 via-white to-[#438D34]/10">
            <Card className="w-full max-w-2xl p-8 shadow-2xl rounded-2xl border border-gray-500">
                <h2 className="text-3xl font-extrabold mb-2 text-center text-[#E84912] flex items-center justify-center gap-2">
                    Upload Your Assets
                </h2>
                <p className="mb-4 text-center text-gray-600">
                    Drag and drop files or folders below.<br />
                    All uploads will go to your <b className="text-[#438D34]">Creatives</b> folder.<br />
                    <span className="text-xs text-[#EA6D51]">You can skip this step if you want.</span>
                </p>
                <div
                    ref={dropRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-[#E84912] rounded-xl p-8 mb-6 flex flex-col items-center justify-center bg-gradient-to-br from-white via-orange-50 to-[#FDD49F]/30 cursor-pointer transition-all hover:shadow-lg hover:bg-orange-50"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <CloudUpload size={48} className="text-black drop-shadow animate-pulse" />
                    </div>
                    <span className="text-gray-700 font-semibold mb-1 text-lg">
                        Drop files or folders here
                    </span>
                    <span className="text-gray-400 text-xs mb-2">
                        You can drag multiple files or entire folders
                    </span>
                    {uploading && (
                        <div className="w-full flex flex-col items-center mt-2">
                            <span className="text-[#E84912] font-semibold mb-1 animate-pulse">Uploading...</span>
                            <div className="w-2/3 h-2 bg-orange-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#E84912] animate-upload-progress" style={{ width: "80%" }} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="mb-6">
                    <h3 className="font-semibold mb-2 text-[#438D34]">Queued Files/Folders:</h3>
                    <div className="border rounded-xl p-4 bg-gradient-to-br from-white via-orange-50 to-[#FDD49F]/30 min-h-[48px] flex flex-col justify-center shadow-sm">
                        {buildNestedTree(treeData).length === 0 ? (
                            <span className="text-gray-400 text-sm text-center">No files or folders yet.</span>
                        ) : (
                            <Tree elements={buildNestedTree(treeData)}>
                                {renderTree(buildNestedTree(treeData))}
                            </Tree>
                        )}
                    </div>
                </div>
                <div className="flex justify-between mt-4">
                    <Button variant="outline" className="rounded-lg border-[#EA6D51] text-[#EA6D51] hover:bg-orange-50" onClick={handleSkip}>Skip</Button>
                    <Button
                        className="bg-gradient-to-r from-[#E84912] via-[#F97316] to-[#EA6D51] text-white font-bold rounded-lg shadow-md hover:from-[#d63d0e] hover:to-[#EA6D51]"
                        onClick={handleFinalSubmit}
                        disabled={uploading || treeData.length === 0}
                    >
                        Final Submit
                    </Button>
                </div>
            </Card>
        </div>
    );
}