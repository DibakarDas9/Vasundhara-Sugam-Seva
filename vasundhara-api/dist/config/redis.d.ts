import Redis from 'ioredis';
export declare const connectRedis: () => Promise<void>;
export declare const disconnectRedis: () => Promise<void>;
export declare const getRedisClient: () => Redis;
export declare const getConnectionStatus: () => boolean;
export declare const getConnectionInfo: () => {
    isConnected: boolean;
    status: string;
    host?: undefined;
    port?: undefined;
} | {
    isConnected: boolean;
    status: "close" | "end" | "wait" | "reconnecting" | "connecting" | "connect" | "ready";
    host: string | undefined;
    port: number | undefined;
};
//# sourceMappingURL=redis.d.ts.map