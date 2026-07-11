interface ApprovalEmailPayload {
    to: string;
    name?: string;
    decision: 'approved' | 'rejected';
    note?: string;
    reason?: string;
}
export declare function sendApprovalDecisionEmail(payload: ApprovalEmailPayload): Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map