export type LocalFile = {
    id: string;
    name: string;
    file: File;
    parentId: string | null;
    type: "file";
    path: string;
};

export type LocalFolder = {
    id: string;
    name: string;
    parentId: string | null;
    type: "folder";
    children: (LocalFile | LocalFolder)[];
    path: string;
};