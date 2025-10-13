"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { Label } from "@/components/ui/label";
import LiquidGlassCard from "@/components/kokonutui/liquid-glass-card";
import FileUpload from "@/components/kokonutui/file-upload";
import Loader from "@/components/kokonutui/loader";
import {
  FileText,
  Folder,
  Image,
  FilePlus,
  Clock,
  Search,
  Filter,
  UploadCloud,
  FileIcon
} from "lucide-react";
import { toast } from "sonner";

type AssetType = {
  id: string;
  name: string;
  type: string;
  mimetype?: string;
  size?: number;
  storage_path?: string;
  created_at?: string;
  updated_at?: string;
  parent_id?: string | null;
  items?: number;
};

interface DirectoryItem {
  type: 'file' | 'folder';
  name: string;
  path: string;
  file?: File;
  size?: number;
  mimetype?: string;
  children?: DirectoryItem[];
}

export default function DashboardClientPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [filterType, setFilterType] = useState("all");
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newType, setNewType] = useState<"upload" | "folder">("upload");
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedItems, setDraggedItems] = useState<DirectoryItem[]>([]);
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryItem[]>([]);
  const [showDirectoryPreview, setShowDirectoryPreview] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<AssetType | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AssetType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFolderSelection, setShowFolderSelection] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState("");
  const [folderSelectionType, setFolderSelectionType] = useState<"existing" | "new">("existing");

  const campaigns = [
    {
      title: "Summer Launch",
      description: "Kick off the summer with our new product line.",
      date: "Jul 10, 2025"
    },
    {
      title: "Back to School",
      description: "Special discounts for students and teachers.",
      date: "Aug 20, 2025"
    },
    {
      title: "Holiday Sale",
      description: "Year-end deals on all categories.",
      date: "Dec 1, 2025"
    }
  ];

  const searchParams = useSearchParams();

  // Update current path when URL search params change
  useEffect(() => {
    const folderParam = searchParams.get('folder');
    if (folderParam) {
      setCurrentPath([folderParam]);
    } else {
      setCurrentPath([]);
    }
  }, [searchParams]);

  // Fetch assets from API
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/client/assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []); // Remove currentPath dependency since we don't need to refetch when path changes

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      let newName = renameValue.trim();
      if (renameTarget.type === "file") {
        const { ext } = getFileNameParts(renameTarget.name);
        newName += ext;
      }
      const res = await fetch(`/api/dashboard/client/assets/${renameTarget.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        toast.success("Renamed successfully!");
        await fetchAssets();
        setShowRenameDialog(false);
        setRenameTarget(null);
        setRenameValue("");
      } else {
        const error = await res.json();
        toast.error(error.message || "Rename failed");
      }
    } catch (error) {
      toast.error("Rename failed");
    } finally {
      setIsRenaming(false);
    }
  };

  // Delete logic
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/client/assets/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Deleted successfully!");
        await fetchAssets();
        setShowDeleteDialog(false);
        setDeleteTarget(null);
      } else {
        const error = await res.json();
        toast.error(error.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle multiple file uploads
  const handleMultipleFileUpload = async (files: File[]) => {
    // Store the files and show folder selection dialog
    setUploadedFiles(files);

    // Set initial selection type based on available folders
    const currentAvailableFolders = assets.filter(a => a.type === "folder" && a.parent_id === getCurrentParentId());
    setFolderSelectionType(currentAvailableFolders.length > 0 ? "existing" : "new");

    setShowFolderSelection(true);
    setShowAddDialog(false); // Close the add dialog
  };

  const handleFinalUpload = async () => {
    setIsCreating(true);
    try {
      let targetFolderId: string | null = getCurrentParentId();

      // If creating a new folder, create it first
      if (folderSelectionType === "new" && newFolderName.trim()) {
        const res = await fetch("/api/dashboard/client/assets/folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newFolderName.trim(),
            parent_id: getCurrentParentId(),
          }),
        });

        if (res.ok) {
          const newFolder = await res.json();
          targetFolderId = newFolder.id;
          toast.success(`Folder "${newFolderName}" created successfully!`);
        } else {
          const error = await res.json();
          toast.error(error.message || "Failed to create folder");
          return;
        }
      } else if (folderSelectionType === "existing" && selectedFolder) {
        targetFolderId = selectedFolder;
      }
      // Remove the "root" condition since we're removing that option

      // Now upload all files to the target folder
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("parent_id", targetFolderId || "");

        return fetch("/api/dashboard/client/assets/upload", {
          method: "POST",
          body: formData,
        });
      });

      const responses = await Promise.all(uploadPromises);
      const successCount = responses.filter(res => res.ok).length;

      if (successCount === uploadedFiles.length) {
        const folderName = folderSelectionType === "new" ? newFolderName :
          folderSelectionType === "existing" ?
            assets.find(a => a.id === selectedFolder)?.name || "selected folder" :
            "current location";
        toast.success(`${successCount} files uploaded successfully to ${folderName}!`);
      } else {
        toast.warning(`${successCount}/${uploadedFiles.length} files uploaded successfully`);
      }

      await fetchAssets(); // Refresh the assets list

      // Reset states - update the initial folderSelectionType
      setShowFolderSelection(false);
      setUploadedFiles([]);
      setSelectedFolder("");
      setNewFolderName("");
      const resetAvailableFolders = assets.filter(a => a.type === "folder" && a.parent_id === getCurrentParentId());
      setFolderSelectionType(resetAvailableFolders.length > 0 ? "existing" : "new");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsCreating(false);
    }
  };

  const processDirectoryEntries = async (items: DataTransferItemList): Promise<DirectoryItem[]> => {
    const entries: DirectoryItem[] = [];

    const traverseFileTree = (item: any, path = ''): Promise<void> => {
      return new Promise<void>((resolve) => {
        if (item.isFile) {
          item.file((file: File) => {
            entries.push({
              type: 'file',
              name: file.name,
              path: path + file.name,
              file: file,
              size: file.size,
              mimetype: file.type
            });
            resolve();
          });
        } else if (item.isDirectory) {
          entries.push({
            type: 'folder',
            name: item.name,
            path: path + item.name + '/',
            children: []
          });

          const dirReader = item.createReader();
          dirReader.readEntries((entries: any[]) => {
            const promises = entries.map(entry =>
              traverseFileTree(entry, path + item.name + '/')
            );
            Promise.all(promises).then(() => resolve());
          });
        }
      });
    };

    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        promises.push(traverseFileTree(item));
      }
    }

    await Promise.all(promises);
    return entries;
  };

  const DirectoryTree = ({ structure, level = 0 }: { structure: DirectoryItem[], level?: number }) => {
    const groupedByPath = structure.reduce((acc, item) => {
      const pathParts = item.path.split('/').filter(Boolean);
      const currentLevel = pathParts[level];

      if (!currentLevel) return acc;

      if (!acc[currentLevel]) {
        acc[currentLevel] = [];
      }
      acc[currentLevel].push(item);
      return acc;
    }, {} as Record<string, DirectoryItem[]>);

    return (
      <div className="space-y-1">
        {Object.entries(groupedByPath).map(([name, items]) => {
          const isFolder = items.some(item => item.type === 'folder' || item.path.split('/').length > level + 1);

          return (
            <div key={name} style={{ paddingLeft: `${level * 16}px` }}>
              <div className="flex items-center gap-2 py-1">
                {isFolder ? (
                  <Folder className="w-4 h-4 text-blue-500" />
                ) : (
                  <FileIcon className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-gray-500">
                  {isFolder ? `(${items.length} items)` : formatFileSize(items[0]?.size || 0)}
                </span>
              </div>

              {isFolder && (
                <DirectoryTree
                  structure={items.filter(item => item.path.split('/').length > level + 1)}
                  level={level + 1}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Add file size formatter
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add directory upload handler
  const handleDirectoryUpload = async () => {
    setIsCreating(true);
    try {
      // First, create a map to track created folders and their IDs
      const folderMap = new Map<string, string>();

      // Get all unique folder paths from the directory structure
      const allFolderPaths = new Set<string>();

      // Extract all folder paths from file paths
      directoryStructure.forEach(item => {
        if (item.type === 'file') {
          const pathParts = item.path.split('/').filter(Boolean);
          pathParts.pop(); // Remove filename

          // Add all parent folder paths
          for (let i = 1; i <= pathParts.length; i++) {
            const folderPath = pathParts.slice(0, i).join('/');
            if (folderPath) {
              allFolderPaths.add(folderPath);
            }
          }
        } else if (item.type === 'folder') {
          const folderPath = item.path.replace(/\/$/, ''); // Remove trailing slash
          if (folderPath) {
            allFolderPaths.add(folderPath);
          }
        }
      });

      // Sort folder paths by depth (shortest first) to create parent folders first
      const sortedFolderPaths = Array.from(allFolderPaths).sort((a, b) => {
        const aDepth = a.split('/').length;
        const bDepth = b.split('/').length;
        return aDepth - bDepth;
      });

      console.log("Creating folders in order:", sortedFolderPaths);

      // Create folders in the correct order (parent folders first)
      for (const folderPath of sortedFolderPaths) {
        const pathParts = folderPath.split('/');
        const folderName = pathParts[pathParts.length - 1];

        // Determine parent ID
        let parentId: string | null = getCurrentParentId(); // Root parent

        if (pathParts.length > 1) {
          // This folder has a parent folder
          const parentPath = pathParts.slice(0, -1).join('/');
          parentId = folderMap.get(parentPath) || parentId;
        }

        // Check if folder already exists
        const existingFolder = assets.find(a =>
          a.name === folderName &&
          a.type === 'folder' &&
          a.parent_id === parentId
        );

        if (existingFolder) {
          // Folder already exists, use its ID
          folderMap.set(folderPath, existingFolder.id);
          console.log(`Folder already exists: ${folderName} (ID: ${existingFolder.id})`);
        } else {
          // Create new folder
          console.log(`Creating folder: ${folderName} with parent: ${parentId}`);

          const res = await fetch("/api/dashboard/client/assets/folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: folderName,
              parent_id: parentId, // This should now be null instead of "null"
            }),
          });

          if (res.ok) {
            const newFolder = await res.json();
            folderMap.set(folderPath, newFolder.id);

            // Update local assets state
            setAssets(prev => [...prev, newFolder]);

            console.log(`Created folder: ${folderName} (ID: ${newFolder.id})`);
          } else {
            const error = await res.json();
            console.error(`Failed to create folder ${folderName}:`, error);
            throw new Error(`Failed to create folder: ${folderName}`);
          }
        }
      }

      // Now upload all files to their respective folders
      const fileItems = directoryStructure.filter(item => item.type === 'file' && item.file);

      console.log(`Uploading ${fileItems.length} files...`);

      const uploadPromises = fileItems.map(async (fileItem) => {
        if (!fileItem.file) return null;

        // Determine the correct parent folder ID for this file
        const pathParts = fileItem.path.split('/').filter(Boolean);
        pathParts.pop(); // Remove filename

        let parentId: string | null = getCurrentParentId(); // Default to root

        if (pathParts.length > 0) {
          // File is inside a folder
          const fileFolderPath = pathParts.join('/');
          parentId = folderMap.get(fileFolderPath) || parentId;
        }

        console.log(`Uploading file: ${fileItem.name} to folder ID: ${parentId}`);

        const formData = new FormData();
        formData.append("file", fileItem.file);
        formData.append("parent_id", parentId || ""); // Convert null to empty string for FormData

        try {
          const response = await fetch("/api/dashboard/client/assets/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            console.error(`Failed to upload ${fileItem.name}:`, error);
            return { success: false, filename: fileItem.name, error };
          }

          const result = await response.json();
          console.log(`Successfully uploaded: ${fileItem.name}`);
          return { success: true, filename: fileItem.name, result };
        } catch (error) {
          console.error(`Error uploading ${fileItem.name}:`, error);
          return { success: false, filename: fileItem.name, error };
        }
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      const validResults = uploadResults.filter(result => result !== null);
      const successCount = validResults.filter(result => result.success).length;
      const failureCount = validResults.length - successCount;

      // Show appropriate success/error messages
      if (failureCount === 0) {
        toast.success(`Directory uploaded successfully! Created ${sortedFolderPaths.length} folders and uploaded ${successCount} files.`);
      } else if (successCount > 0) {
        toast.warning(`Partially uploaded: ${successCount} files succeeded, ${failureCount} files failed.`);
      } else {
        toast.error("Failed to upload directory");
      }

      // Refresh the assets list to show new folders and files
      await fetchAssets();

      // Close dialogs and reset state
      setShowAddDialog(false);
      setShowDirectoryPreview(false);
      setDirectoryStructure([]);

    } catch (error) {
      console.error("Directory upload error:", error);
      toast.error(`Failed to upload directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/dashboard/client/assets/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          parent_id: getCurrentParentId(),
        }),
      });

      if (res.ok) {
        toast.success(`Folder "${newName}" created successfully!`);
        await fetchAssets(); // Refresh the assets list
        setShowAddDialog(false);
        setNewName("");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to create folder");
      }
    } catch (error) {
      toast.error("Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  const getCurrentParentId = (): string | null => {
    if (currentPath.length === 0) return null;

    const parentFolderName = currentPath[currentPath.length - 1];
    const parentFolder = assets.find(a => a.name === parentFolderName && a.type === "folder");

    return parentFolder?.id || null; // Return null instead of undefined
  };

  // Update the navigation function to use window.history instead of setCurrentPath
  const navigateToFolder = (folderName?: string) => {
    if (folderName) {
      // Navigate to specific folder
      const newUrl = `/dashboard/client?folder=${encodeURIComponent(folderName)}`;
      window.history.pushState({}, '', newUrl);
      setCurrentPath([folderName]);
    } else {
      // Navigate to root
      const newUrl = `/dashboard/client`;
      window.history.pushState({}, '', newUrl);
      setCurrentPath([]);
    }
  };

  const parentId = currentPath.length === 0
    ? null
    : assets.find(a => a.name === currentPath[currentPath.length - 1] && a.type === "folder")?.id;

  const filteredAssets = assets.filter(a => a.parent_id === parentId);

  const getFileNameParts = (filename: string) => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) return { name: filename, ext: "" };
    return {
      name: filename.substring(0, lastDot),
      ext: filename.substring(lastDot), // includes the dot
    };
  };

  const cardBgColors = [
    "from-pink-50 via-white to-yellow-50",
    "from-sky-50 via-white to-green-50",
    "from-purple-50 via-white to-blue-50",
    "from-orange-50 via-white to-red-50",
    "from-lime-50 via-white to-teal-50",
    "from-indigo-50 via-white to-fuchsia-50",
    "from-amber-50 via-white to-rose-50",
    "from-cyan-50 via-white to-gray-50",
  ];

  const meetings = [
    { title: "Client Review", time: "2:00 PM", date: "Today" },
    { title: "Design Workshop", time: "11:00 AM", date: "Tomorrow" },
    { title: "Team Sync", time: "9:30 AM", date: "Oct 7" },
  ];

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/dashboard/client");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    fetchUser();
  }, []);

  // Filter and sort files based on current assets
  const filteredFiles = filteredAssets
    .filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || asset.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "type") return a.type.localeCompare(b.type);
      if (sort === "date") {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

  const availableFolders = assets.filter(a => a.type === "folder" && a.parent_id === getCurrentParentId());

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 lg:mr-80">
        {/* Header with Filter & Sort Controls */}
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="tracking-tighter text-2xl md:text-3xl font-bold text-gray-900">
              Welcome, <span className="font-cursive tracking-normal text-[#E84912]">{user?.name || "Loading..."}!</span> These are your assets.
            </h1>
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button className="lg:hidden p-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Label htmlFor="search-files" className="sr-only">Search files</Label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="search-files"
                type="text"
                placeholder="Search files..."
                className="pl-10 pr-3 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-2 min-w-[150px]">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E84912] focus:border-transparent">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="folder">Folders</SelectItem>
                  <SelectItem value="file">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="min-w-[150px]">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E84912] focus:border-transparent">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="type">Sort by Type</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
              {search && ` matching "${search}"`}
              {filterType !== "all" && ` in ${filterType}s`}
            </span>
            {(search || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterType("all");
                }}
                className="text-[#E84912] hover:text-[#d63d0e] font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={() => navigateToFolder()}
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentPath.map((folder, idx) => (
              <React.Fragment key={folder}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {idx === currentPath.length - 1 ? (
                    <BreadcrumbPage>{folder}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href="#"
                      onClick={() => {
                        const newPath = currentPath.slice(0, idx + 1);
                        navigateToFolder(newPath[newPath.length - 1]);
                      }}
                    >
                      {folder}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
              Loading...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <LiquidGlassCard
                variant="primary"
                size="default"
                hover="glow"
                showShineBorder={false}
                glassEffect={true}
                className="group relative w-full max-w-xl h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-3xl cursor-pointer hover:border-[#E84912] transition-all duration-300"
                onClick={() => setShowAddDialog(true)}
                title="Add New File or Folder"
              >
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#E84912]/10 transition-all duration-300">
                    <svg className="w-12 h-12 text-gray-400 group-hover:text-[#E84912] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-500 group-hover:text-[#E84912] transition-colors text-lg">
                    Add New File or Folder
                  </span>
                  <span className="text-sm text-gray-400 text-center max-w-md">
                    You don&apos;t have any files or folders yet.<br />
                    Click here to upload or create your first asset!
                  </span>
                </div>
              </LiquidGlassCard>
            </div>
          ) : (
            <>
              {filteredFiles.map((asset, index) => (
                <ContextMenu key={asset.id}>
                  <ContextMenuTrigger asChild>
                    <LiquidGlassCard
                      variant="primary"
                      size="default"
                      hover="glow"
                      glassEffect={true}
                      className={`group relative h-48 flex flex-col justify-between border border-gray-200 rounded-2xl cursor-pointer bg-gradient-to-br ${cardBgColors[index % cardBgColors.length]}`}
                      onClick={() => {
                        if (asset.type === "folder") {
                          navigateToFolder(asset.name);
                        }
                      }}
                    >
                      {/* Background Illustration */}
                      <div className="absolute inset-0 pointer-events-none opacity-10">
                        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-sky-200 to-sky-300 rounded-lg rotate-12" />
                        <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-beige-200 to-beige-300 rounded-lg rotate-45" />
                        <div className="absolute bottom-6 left-4 w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-md -rotate-12" />
                      </div>
                      {/* Card Header */}
                      <div className="relative z-10 flex items-center justify-between mb-2">
                        <div className="p-3 rounded-xl bg-white/80 border border-white/40 shadow-sm">
                          {asset.type === "folder" ? <Folder className="w-6 h-6 text-sky-600" /> :
                            asset.type === "image" ? <Image className="w-6 h-6 text-sky-600" /> :
                              <FileText className="w-6 h-6 text-sky-600" />}
                        </div>
                        <span className="px-2 py-1 rounded-full bg-white/60 border border-white/40 text-xs font-medium text-gray-600">
                          {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                        </span>
                      </div>
                      {/* Gradient Overlay for Text Readability */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 via-white/50 to-transparent rounded-b-2xl pointer-events-none" />
                      {/* Card Content */}
                      <div className="relative z-10 flex-1 flex flex-col justify-end">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">
                          {asset.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {asset.type === "folder"
                            ? `Contains ${asset.items ?? 0} items`
                            : asset.type === "image"
                              ? "High resolution image"
                              : asset.mimetype || "Document"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">
                            {asset.type === "folder" ? `${asset.items ?? 0} items` : asset.created_at?.slice(0, 10)}
                          </span>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 transition-all duration-300">
                            <svg className="w-3 h-3 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuLabel>{asset.name}</ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => {
                        setRenameTarget(asset);
                        if (asset.type === "file") {
                          const { name } = getFileNameParts(asset.name);
                          setRenameValue(name);
                        } else {
                          setRenameValue(asset.name);
                        }
                        setShowRenameDialog(true);
                      }}
                    >
                      Rename
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setDeleteTarget(asset);
                        setShowDeleteDialog(true);
                      }}
                      variant="destructive"
                    >
                      Delete
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => {/* handle download logic */ }}>
                      Download
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
              {/* Add New File/Folder Card */}
              <LiquidGlassCard
                variant="primary"
                size="default"
                hover="glow"
                showShineBorder={false}
                glassEffect={true}
                className="group relative h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-2xl cursor-pointer hover:border-[#E84912] transition-all duration-300"
                onClick={() => setShowAddDialog(true)}
                title="Add New File or Folder"
              >
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#E84912]/10 transition-all duration-300">
                    <svg className="w-7 h-7 text-gray-400 group-hover:text-[#E84912] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-500 group-hover:text-[#E84912] transition-colors text-sm">
                    Add New File or Folder
                  </span>
                </div>
              </LiquidGlassCard>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - Calendar & Meetings */}
      <div className="w-80 border-l-1 border-slate-500 bg-white fixed right-0 top-16 bottom-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 md:translate-x-full">
        <div className="h-full p-6 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            {/* Calendar Section - Fixed at the Top */}
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg w-full"
                />
              </div>
            </div>

            {/* Top Campaigns Section - Scrollable in the Middle */}
            <div className="flex-1 overflow-y-auto space-y-4 mt-4">
              <h2 className="text-lg font-bold text-gray-900">Campaigns</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {campaigns.map((campaign, index) => (
                  <div
                    key={index}
                    className="min-w-[220px] max-w-xs group bg-gradient-to-r from-white to-gray-50 rounded-lg p-4 border border-gray-100 hover:border-[#E84912]/30 hover:shadow transition-all duration-200 cursor-pointer"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-[#E84912] transition-colors truncate">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        {campaign.date}
                      </span>
                      <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Meetings Section - Fixed at the Bottom */}
            <div className="flex-shrink-0 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#E84912] rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">Upcoming Meetings</h2>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {meetings.length}
                </span>
              </div>

              <div className="space-y-2">
                {meetings.map((meeting, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-r from-white to-gray-50 rounded-lg p-2 border border-gray-100 hover:border-[#E84912]/30 hover:shadow transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <div className="relative p-1 rounded bg-[#E84912]/10 border border-[#E84912]/10 group-hover:bg-[#E84912]/20 group-hover:border-[#E84912]/20 transition-all duration-200">
                          <Clock className="w-3 h-3 text-[#E84912]" />
                          {index === 0 && (
                            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-[#E84912] transition-colors truncate text-xs">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                            {meeting.date}
                          </span>
                          <span className="text-[10px] font-medium text-gray-700">
                            {meeting.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                          <svg
                            className="w-2.5 h-2.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Meeting Button */}
                <div className="pt-2 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-gray-300 hover:border-[#E84912]/50 hover:bg-[#E84912]/5 transition-all duration-200 group">
                    <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-[#E84912]/10 flex items-center justify-center transition-all duration-200 group-hover:rotate-90">
                      <span className="text-gray-500 group-hover:text-[#E84912] font-bold text-xs">
                        +
                      </span>
                    </div>
                    <span className="font-medium text-gray-600 group-hover:text-[#E84912] transition-colors text-xs">
                      See All
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden opacity-0 pointer-events-none transition-opacity duration-300"></div>
      </div>

      {/* Add File/Folder Dialog */}
      {showAddDialog && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New File or Folder</DialogTitle>
              <DialogDescription>
                Upload files by dragging and dropping, create new folders, or drag entire folder structures.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-4 flex-1 overflow-hidden">
              {!showDirectoryPreview ? (
                <>
                  {/* Action Type Selection */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewType("upload")}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${newType === "upload"
                        ? "border-[#E84912] bg-[#E84912]/5 text-[#E84912]"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-4 h-4" />
                        <span className="font-medium text-sm">Upload Files</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setNewType("folder")}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${newType === "folder"
                        ? "border-[#E84912] bg-[#E84912]/5 text-[#E84912]"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Folder className="w-4 h-4" />
                        <span className="font-medium text-sm">New Folder</span>
                      </div>
                    </button>
                  </div>

                  {/* Content based on selection */}
                  {newType === "upload" ? (
                    <div className="space-y-4">
                      {/* Single Unified Drop Zone for Files and Folders */}
                      <div
                        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#E84912]/50 transition-colors cursor-pointer"
                        onDrop={async (e) => {
                          e.preventDefault();
                          const items = e.dataTransfer.items;

                          if (items) {
                            setIsCreating(true);
                            try {
                              const structure = await processDirectoryEntries(items);
                              setDirectoryStructure(structure);

                              // Check if there are folders in the structure
                              const hasFolders = structure.some(item => item.type === 'folder');

                              if (hasFolders) {
                                setShowDirectoryPreview(true);
                              } else {
                                // Just files, upload directly
                                const files = structure
                                  .filter((item): item is DirectoryItem & { file: File } =>
                                    item.type === 'file' && item.file !== undefined
                                  )
                                  .map(item => item.file);
                                await handleMultipleFileUpload(files);
                              }
                            } catch (error) {
                              toast.error("Error processing dropped items");
                            } finally {
                              setIsCreating(false);
                            }
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={(e) => e.preventDefault()}
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <UploadCloud className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Drag & Drop Files or Folders
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Drop files, folders, or entire directory structures here, or click to browse
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              Supports: Images, PDFs, Documents, ZIP files, and folder structures
                            </p>
                            <div className="flex gap-2 justify-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Max 10MB per file
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Multiple files supported
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hidden file inputs */}
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.txt,.zip"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          handleMultipleFileUpload(files);
                        }}
                        className="hidden"
                        id="file-input"
                      />

                      <input
                        type="file"
                        multiple
                        {...({ webkitdirectory: "" } as any)}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const structure: DirectoryItem[] = files.map(file => ({
                              type: 'file' as const,
                              name: file.name,
                              path: (file as any).webkitRelativePath || file.name,
                              file: file,
                              size: file.size,
                              mimetype: file.type
                            }));

                            setDirectoryStructure(structure);
                            setShowDirectoryPreview(true);
                          }
                        }}
                        className="hidden"
                        id="folder-input"
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => document.getElementById('file-input')?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                        >
                          <FileIcon className="w-4 h-4" />
                          Select Files
                        </button>
                        <button
                          onClick={() => document.getElementById('folder-input')?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                        >
                          <Folder className="w-4 h-4" />
                          Select Folder
                        </button>
                      </div>
                    </div>
                  ) : newType === "folder" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="font-medium text-gray-900 mb-1">Create New Folder</h3>
                          <p className="text-sm text-gray-500">Enter a name for your new folder</p>
                        </div>
                      </div>

                      <Input
                        placeholder="Folder Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-center"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newName.trim()) {
                            handleCreateFolder();
                          }
                        }}
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                /* Directory Structure Preview */
                <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Directory Preview</h3>
                    <button
                      onClick={() => {
                        setShowDirectoryPreview(false);
                        setDirectoryStructure([]);
                      }}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 flex-1 overflow-y-auto max-h-60">
                    <DirectoryTree structure={directoryStructure} />
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isCreating && (
                <div className="flex items-center justify-center p-4">
                  <Loader
                    title="Processing..."
                    subtitle="Please wait while we process your files"
                    size="sm"
                  />
                </div>
              )}

              <DialogFooter className="flex gap-2 flex-shrink-0 pt-3 border-t">
                <DialogClose asChild>
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium transition-colors text-sm"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                </DialogClose>

                {showDirectoryPreview ? (
                  <button
                    className="px-4 py-2 rounded-lg bg-[#E84912] text-white hover:bg-[#d63d0e] font-medium transition-colors disabled:opacity-50 text-sm"
                    onClick={handleDirectoryUpload}
                    disabled={isCreating}
                  >
                    {isCreating ? "Uploading..." : `Upload ${directoryStructure.length} Items`}
                  </button>
                ) : newType === "folder" ? (
                  <button
                    className="px-4 py-2 rounded-lg bg-[#E84912] text-white hover:bg-[#d63d0e] font-medium transition-colors disabled:opacity-50 text-sm"
                    onClick={handleCreateFolder}
                    disabled={!newName.trim() || isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Folder"}
                  </button>
                ) : null}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showFolderSelection && (
        <Dialog open={showFolderSelection} onOpenChange={setShowFolderSelection}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Choose Destination Folder</DialogTitle>
              <DialogDescription>
                You're uploading {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}. Where would you like to save {uploadedFiles.length > 1 ? 'them' : 'it'}?
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-4">
              {/* Folder Selection Options */}
              <div className="space-y-3">
                {/* Existing Folders Option */}
                {availableFolders.length > 0 && (
                  <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${folderSelectionType === "existing" ? "border-[#E84912] bg-[#E84912]/5" : "border-gray-200"
                    }`}>
                    <input
                      type="radio"
                      name="folderChoice"
                      value="existing"
                      checked={folderSelectionType === "existing"}
                      onChange={() => setFolderSelectionType("existing")}
                      className="mt-0.5 text-[#E84912] focus:ring-[#E84912]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Folder className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900">Existing Folder</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose from existing folders in {currentPath.length > 0 ? currentPath.join(' / ') : 'current location'}
                      </p>

                      {folderSelectionType === "existing" && (
                        <select
                          value={selectedFolder}
                          onChange={(e) => setSelectedFolder(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E84912] focus:border-transparent"
                        >
                          <option value="">Select a folder...</option>
                          {availableFolders.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name} ({folder.items || 0} items)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                )}

                {/* New Folder Option */}
                <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${folderSelectionType === "new" ? "border-[#E84912] bg-[#E84912]/5" : "border-gray-200"
                  }`}>
                  <input
                    type="radio"
                    name="folderChoice"
                    value="new"
                    checked={folderSelectionType === "new"}
                    onChange={() => setFolderSelectionType("new")}
                    className="mt-0.5 text-[#E84912] focus:ring-[#E84912]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Folder className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-900">New Folder</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Create a new folder in {currentPath.length > 0 ? currentPath.join(' / ') : 'current location'} for these files
                    </p>

                    {folderSelectionType === "new" && (
                      <Input
                        placeholder="Enter folder name..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        autoFocus
                        className="w-full"
                      />
                    )}
                  </div>
                </label>
              </div>

              {/* File Preview */}
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Files to upload ({uploadedFiles.length}):
                </h4>
                <div className="space-y-1">
                  {uploadedFiles.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-700 truncate">{file.name}</span>
                      <span className="text-gray-500 text-xs">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                  ))}
                  {uploadedFiles.length > 5 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ... and {uploadedFiles.length - 5} more files
                    </p>
                  )}
                </div>
              </div>

              {/* Loading state */}
              {isCreating && (
                <div className="flex items-center justify-center p-4">
                  <Loader
                    title="Uploading..."
                    subtitle="Please wait while we upload your files"
                    size="sm"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2 pt-3 border-t">
              <DialogClose asChild>
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium transition-colors text-sm"
                  disabled={isCreating}
                  onClick={() => {
                    setShowFolderSelection(false);
                    setUploadedFiles([]);
                    setSelectedFolder("");
                    setNewFolderName("");
                    const resetAvailableFolders = assets.filter(a => a.type === "folder" && a.parent_id === getCurrentParentId());
                    setFolderSelectionType(resetAvailableFolders.length > 0 ? "existing" : "new");
                  }}
                >
                  Cancel
                </button>
              </DialogClose>

              <button
                className="px-4 py-2 rounded-lg bg-[#E84912] text-white hover:bg-[#d63d0e] font-medium transition-colors disabled:opacity-50 text-sm"
                onClick={handleFinalUpload}
                disabled={
                  isCreating ||
                  (folderSelectionType === "existing" && !selectedFolder) ||
                  (folderSelectionType === "new" && !newFolderName.trim())
                }
              >
                {isCreating ? "Uploading..." : `Upload ${uploadedFiles.length} Files`}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameTarget?.type === "folder" ? "Folder" : "File"}</DialogTitle>
            <DialogDescription>
              Enter a new name for <span className="font-semibold">{renameTarget?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-2">
            <Input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              autoFocus
              disabled={isRenaming}
              className="mt-0"
              onKeyDown={e => {
                if (e.key === "Enter" && renameValue.trim()) handleRename();
              }}
              style={{ flex: 1 }}
            />
            {renameTarget?.type === "file" && (
              <span className="text-gray-500 text-sm select-none">
                {getFileNameParts(renameTarget.name).ext}
              </span>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" disabled={isRenaming}>
                Cancel
              </button>
            </DialogClose>
            <button
              className="px-4 py-2 rounded bg-[#E84912] text-white hover:bg-[#d63d0e]"
              disabled={!renameValue.trim() || isRenaming}
              onClick={handleRename}
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.type === "folder" ? "Folder" : "File"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" disabled={isDeleting}>
                Cancel
              </button>
            </DialogClose>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}