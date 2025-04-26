// Type declarations for @vibing-ai/sdk
declare module '@vibing-ai/sdk/app' {
  export function createApp(config: {
    id: string;
    name: string;
    onInitialize?: (context: any) => Promise<void>;
    render: (props: { mount: HTMLElement }) => (() => void) | void;
  }): any;
}

declare module '@vibing-ai/sdk/common/memory' {
  type MemoryOptions = {
    fallback?: any;
    scope?: 'global' | 'project' | 'conversation';
  };

  interface MemoryResult<T> {
    data: T;
    update: (updater: (current: T) => T) => void;
  }

  export function useMemory<T = any>(key: string, options?: MemoryOptions): MemoryResult<T>;
}

declare module '@vibing-ai/sdk/common/permissions' {
  type PermissionRequest = {
    type: string;
    access: string[];
    scope: string;
    purpose?: string;
    duration?: number;
  };

  interface PermissionsAPI {
    request: (permission: PermissionRequest) => Promise<boolean>;
    check: (permission: PermissionRequest) => Promise<boolean>;
    requestAll: (permissions: PermissionRequest[]) => Promise<boolean>;
    revoke: (permission: PermissionRequest) => Promise<boolean>;
  }

  export function usePermissions(): PermissionsAPI;
}

declare module '@vibing-ai/sdk/common/super-agent' {
  type SuperAgentContext = Record<string, any>;
  
  interface SuperAgentAPI {
    askSuperAgent: (query: string, options?: any) => Promise<string>;
    suggestAction: (suggestion: any) => Promise<boolean>;
    onIntent: (intent: string, callback: (params: any) => Promise<any>) => () => void;
    getConversationContext: () => Promise<SuperAgentContext>;
  }

  export function useSuperAgent(): SuperAgentAPI;
}

// Add window memory type declaration
interface Window {
  memory: {
    get: <T = any>(key: string) => Promise<T | null>;
    set: <T = any>(key: string, value: T) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
} 