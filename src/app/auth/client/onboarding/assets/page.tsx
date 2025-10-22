"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { Tree, Folder, File, type TreeViewElement } from "@/components/ui/file-tree";
import Loader from "@/components/kokonutui/loader";
import { useLanguage } from "@/context/LanguageProvider";
import type { LocalFile, LocalFolder } from "@/types/local-assets";

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
    const { t } = useLanguage();

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
                toast.error(t("assets.fetchCreativesError") || "Failed to fetch Creatives folder.");
            }
        }
        fetchCreativesFolder();
    }, [t]);

    useEffect(() => {
        setTreeData(getLocalFiles());
    }, []);

    useEffect(() => {
        async function fetchClientName() {
            try {
                const res = await fetch("/api/dashboard/client");
                const data = await res.json();
                setClientName(data.name || t("assets.clientDefault") || "Client");
            } catch {
                setClientName(t("assets.clientDefault") || "Client");
            }
            setTimeout(() => setShowSplash(false), 1800);
        }
        fetchClientName();
    }, [t]);

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

        toast.success(
            t("assets.addedToQueue").replace("{{count}}", String(newItems.length)) ||
            `${newItems.length} item(s) added to queue`
        );
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    async function uploadRecursive(items: (LocalFile | LocalFolder)[], parentPath: string) {
        for (const item of items) {
            if (item.type === "file") {
                const formData = new FormData();
                formData.append("file", item.file);
                formData.append("parent_id", creativesFolderId!);
                formData.append("folder_path", item.path);

                await fetch("/api/client/onboarding/creatives/upload", {
                    method: "POST",
                    body: formData,
                });
            } else if (item.type === "folder") {
                await uploadRecursive(item.children, item.path);
            }
        }
    }

    const handleFinalSubmit = async () => {
        if (!creativesFolderId) return toast.error(t("assets.noCreativesFolder") || "Creatives folder not found.");
        setUploading(true);

        await uploadRecursive(treeData, "");

        setUploading(false);
        setLocalFiles([]);
        setTreeData([]);
        toast.success(t("assets.uploadedAll") || "Uploaded all files! Redirecting...");
        setTimeout(() => {
            window.location.href = "/dashboard/client";
        }, 1500);
    };

    const handleSkip = () => {
        setLocalFiles([]);
        setTreeData([]);
        window.location.href = "/dashboard/client";
    };

    function buildNestedTree(flat: (LocalFile | LocalFolder)[]): TreeViewElement[] {
        const map: Record<string, TreeViewElement & { children?: TreeViewElement[] }> = {};
        const roots: TreeViewElement[] = [];

        flat.forEach(item => {
            map[item.id] = {
                id: item.id,
                name: item.name,
                ...(item.type === "folder" ? { children: [] } : {}),
            };
        });

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
        // Collect all descendant IDs for cascade delete
        function collectDescendantIds(items: (LocalFile | LocalFolder)[], targetId: string): Set<string> {
            const ids = new Set<string>();
            function recurse(currentId: string) {
                ids.add(currentId);
                items.forEach(item => {
                    if (item.parentId === currentId) {
                        recurse(item.id);
                    }
                });
            }
            recurse(targetId);
            return ids;
        }

        const descendantIds = collectDescendantIds(treeData, id);

        // Remove all items whose id is in descendantIds
        const updated = treeData.filter(item => !descendantIds.has(item.id));
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
                            {t("assets.remove") || "Remove"}
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
                            {t("assets.remove") || "Remove"}
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
                    title={t("assets.splashTitle").replace("{{client}}", clientName) || `Before we finish some changes for ${clientName}...`}
                    subtitle={t("assets.splashSubtitle") || "Please wait while we prepare everything for you"}
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
                        {t("assets.uploading") || "Uploading your assets..."}
                    </h2>
                    <span className="text-gray-600 text-center mb-2">
                        {t("assets.uploadingDesc") || (
                            <>
                                Please wait while we securely upload your files and folders.<br />
                                <span className="text-xs text-[#EA6D51]">Do not close this window.</span>
                            </>
                        )}
                    </span>
                    <div className="w-64 h-3 bg-orange-100 rounded-full overflow-hidden shadow">
                        <div className="h-full bg-gradient-to-r from-[#E84912] via-[#F97316] to-[#EA6D51] animate-upload-progress" style={{ width: "80%" }} />
                    </div>
                    <span className="text-[#E84912] font-semibold animate-pulse mt-2">{t("assets.uploading") || "Uploading..."}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E84912]/10 via-white to-[#438D34]/10 p-4">
            <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl shadow-2xl border-2 border-slate-300 bg-white overflow-hidden">
                {/* Left: Upload UI */}
                <div className="flex-1 flex flex-col justify-center px-8 py-12">
                    <h2 className="text-3xl font-extrabold mb-2 text-[#E84912] flex items-center gap-2">
                        {t("assets.uploadTitle") || "Upload Your Assets"}
                    </h2>
                    <p className="mb-4 text-gray-800">
                        {t("assets.uploadDesc") || (
                            <>
                                Drag and drop files or folders below.<br />
                                All uploads will go to your <b className="text-black">Creatives</b> folder.<br />
                                <span className="text-xs text-gray-500">You can skip this step if you want.</span>
                            </>
                        )}
                    </p>
                    <div
                        ref={dropRef}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-black rounded-xl p-8 mb-6 flex flex-col items-center justify-center bg-gray-50 cursor-pointer transition-all hover:shadow-lg hover:bg-gray-100"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <CloudUpload size={48} className="text-black drop-shadow animate-pulse" />
                        </div>
                        <span className="text-black font-semibold mb-1 text-lg">
                            {t("assets.dropHere") || "Drop files or folders here"}
                        </span>
                        <span className="text-gray-500 text-xs mb-2">
                            {t("assets.dragMultiple") || "You can drag multiple files or entire folders"}
                        </span>
                        {uploading && (
                            <div className="w-full flex flex-col items-center mt-2">
                                <span className="text-black font-semibold mb-1 animate-pulse">{t("assets.uploading") || "Uploading..."}</span>
                                <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-black animate-upload-progress" style={{ width: "80%" }} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2 text-black">{t("assets.queued") || "Queued Files/Folders:"}</h3>
                        <div
                            className="border border-black rounded-xl p-4 bg-gray-50 min-h-[48px] flex flex-col justify-center shadow-sm overflow-y-auto"
                            style={{ maxHeight: "260px" }} // Adjust maxHeight as needed
                        >
                            {buildNestedTree(treeData).length === 0 ? (
                                <span className="text-gray-500 text-sm text-center">{t("assets.noFiles") || "No files or folders yet."}</span>
                            ) : (
                                <Tree elements={buildNestedTree(treeData)}>
                                    {renderTree(buildNestedTree(treeData))}
                                </Tree>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <Button variant="outline" className="rounded-lg border-black text-black hover:bg-gray-100" onClick={handleSkip}>
                            {t("assets.skip") || "Skip"}
                        </Button>
                        <Button
                            className="bg-black text-white font-bold rounded-lg shadow-md hover:bg-gray-900"
                            onClick={handleFinalSubmit}
                            disabled={uploading || treeData.length === 0}
                        >
                            {t("assets.finalSubmit") || "Final Submit"}
                        </Button>
                    </div>
                </div>
                {/* Right: Juno Isologo */}
                <div className="flex-1 flex items-center justify-center bg-white">
                    <img
                        src="/resources/favicons/isologos.png"
                        alt="Juno Isologo"
                        className="w-64 h-64 object-contain drop-shadow-xl"
                    />
                </div>
            </div>
        </div>
    );
}