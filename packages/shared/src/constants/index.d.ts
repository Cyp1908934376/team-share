export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly REGISTER: "/auth/register";
        readonly LOGIN: "/auth/login";
        readonly ME: "/auth/me";
        readonly CHANGE_PASSWORD: "/auth/change-password";
    };
    readonly USERS: {
        readonly BASE: "/users";
        readonly ME: "/users/me";
        readonly BY_ID: (id: string) => string;
        readonly RESOURCES: (id: string) => string;
    };
    readonly TEAMS: {
        readonly BASE: "/teams";
        readonly BY_ID: (id: string) => string;
        readonly MEMBERS: (id: string) => string;
        readonly MEMBER: (teamId: string, userId: string) => string;
    };
    readonly RESOURCES: {
        readonly BASE: "/resources";
        readonly BY_ID: (id: string) => string;
        readonly STAR: (id: string) => string;
        readonly PUBLISH: (id: string) => string;
        readonly VERSIONS: (id: string) => string;
    };
    readonly ENVIRONMENTS: {
        readonly BASE: "/environments";
        readonly BY_ID: (id: string) => string;
        readonly SNAPSHOT: (id: string) => string;
        readonly HEALTH: (id: string) => string;
    };
    readonly WORKFLOWS: {
        readonly BASE: "/workflows";
        readonly BY_ID: (id: string) => string;
        readonly EXECUTE: (id: string) => string;
        readonly EXECUTIONS: (id: string) => string;
        readonly EXECUTION: (workflowId: string, executionId: string) => string;
    };
    readonly MONITORING: {
        readonly DASHBOARD: "/monitoring/dashboard";
        readonly STATS: "/monitoring/stats";
        readonly RESOURCES: "/monitoring/resources";
        readonly WORKFLOWS: "/monitoring/workflows";
        readonly ACTIVITY: "/monitoring/activity";
        readonly ACTIVITIES: "/monitoring/activities";
        readonly HEALTH: "/monitoring/health";
    };
    readonly NOTIFICATIONS: {
        readonly BASE: "/notifications";
        readonly READ_ALL: "/notifications/read-all";
        readonly READ: (id: string) => string;
    };
};
export declare const RESOURCE_TYPE_LABELS: Record<string, string>;
export declare const RESOURCE_TYPE_ICONS: Record<string, string>;
export declare const RESOURCE_STATUS_LABELS: Record<string, string>;
export declare const VERSION_STATUS_LABELS: Record<string, string>;
export declare const EXECUTION_STATUS_LABELS: Record<string, string>;
export declare const TEAM_ROLE_LABELS: Record<string, string>;
export declare const DEFAULT_PAGE = 1;
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
