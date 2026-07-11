import Queue from 'bull';
declare const expiryAlertQueue: Queue.Queue<any>;
declare const emailQueue: Queue.Queue<any>;
declare const smsQueue: Queue.Queue<any>;
declare const analyticsQueue: Queue.Queue<any>;
export declare const startJobProcessor: () => Promise<void>;
export { expiryAlertQueue, emailQueue, smsQueue, analyticsQueue };
//# sourceMappingURL=jobProcessor.d.ts.map