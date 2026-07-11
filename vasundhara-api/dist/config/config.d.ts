export declare const config: {
    app: {
        name: string;
        version: string;
        env: string;
        debug: boolean;
    };
    server: {
        host: string;
        port: number;
    };
    port: number;
    nodeEnv: string;
    database: {
        mongodb: {
            uri: string;
            database: string;
            options: {
                maxPoolSize: number;
                serverSelectionTimeoutMS: number;
                socketTimeoutMS: number;
            };
        };
    };
    redis: {
        uri: string;
        options: {};
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
        issuer: string;
        audience: string;
    };
    cors: {
        allowedOrigins: string[];
    };
    externalServices: {
        ml: {
            url: string;
            timeout: number;
        };
    };
    email: {
        enabled: boolean;
        service: string;
        from: string;
        apiKey: string | undefined;
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            user: string;
            pass: string;
        };
    };
    jobs: {
        redis: string;
        concurrency: number;
        retryAttempts: number;
        retryDelay: number;
    };
    logging: {
        level: string;
        format: string;
        file: string;
    };
};
//# sourceMappingURL=config.d.ts.map