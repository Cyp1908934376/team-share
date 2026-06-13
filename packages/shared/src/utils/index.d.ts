export declare function formatRelativeTime(date: Date | string): string;
export declare function formatFileSize(bytes: number): string;
export declare function formatNumber(num: number): string;
export declare function generateSlug(text: string): string;
export declare function truncateText(text: string, maxLength: number): string;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function deepClone<T>(obj: T): T;
export declare function isEmpty(value: any): boolean;
export declare function getInitials(name: string): string;
export declare function isValidEmail(email: string): boolean;
export declare function generateId(length?: number): string;
export declare function parseSemver(version: string): {
    major: number;
    minor: number;
    patch: number;
} | null;
export declare function compareSemver(a: string, b: string): number;
