import mongoose from 'mongoose';
export declare const connectDatabase: () => Promise<void>;
export declare const disconnectDatabase: () => Promise<void>;
export declare const getConnectionStatus: () => boolean;
export declare const getConnectionInfo: () => {
    isConnected: boolean;
    readyState: mongoose.ConnectionStates;
    host: string;
    port: number;
    name: string;
};
//# sourceMappingURL=database.d.ts.map