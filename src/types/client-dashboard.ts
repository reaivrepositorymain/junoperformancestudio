export type AssetType = {
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

export type SidebarNavigationItem = {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    isSpecial?: boolean;
    folderId?: string;
    itemCount?: number;
};

export interface DashboardLayoutProps {
    children: React.ReactNode;
}

export interface DirectoryItem {
    type: 'file' | 'folder';
    name: string;
    path: string;
    file?: File;
    size?: number;
    mimetype?: string;
    children?: DirectoryItem[];
}