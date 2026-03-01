import { Client, Briefing, BrandProfile } from '../supabase.js';
export declare class ClientRepository {
    static create(data: unknown): Promise<Client>;
    static getById(id: string): Promise<Client | null>;
    static getAll(): Promise<Client[]>;
    static update(id: string, data: Partial<unknown>): Promise<Client>;
    static delete(id: string): Promise<void>;
}
export declare class BriefingRepository {
    static create(data: unknown): Promise<Briefing>;
    static getById(id: string): Promise<Briefing | null>;
    static getByClientId(clientId: string): Promise<Briefing[]>;
    static approve(id: string, approvedBy: string): Promise<Briefing>;
    static update(id: string, data: Partial<unknown>): Promise<Briefing>;
    static delete(id: string): Promise<void>;
}
export declare class BrandProfileRepository {
    static create(data: unknown): Promise<BrandProfile>;
    static getById(id: string): Promise<BrandProfile | null>;
    static getByClientId(clientId: string): Promise<BrandProfile | null>;
    static update(id: string, data: Partial<unknown>): Promise<BrandProfile>;
    static delete(id: string): Promise<void>;
}
export interface CopyDeliverable {
    id: string;
    client_id: string;
    briefing_id: string;
    headline: string;
    subheadline: string;
    body_text: string;
    cta: string;
    social_post: string;
    instagram_carousel?: Record<string, unknown>;
    linkedin_posts?: Record<string, unknown>;
    landing_page_draft?: Record<string, unknown>;
    workflow_run_id?: string;
    status: string;
    created_at: string;
    updated_at: string;
}
export declare class DeliverableRepository {
    static create(data: unknown): Promise<CopyDeliverable>;
    static getById(id: string): Promise<CopyDeliverable | null>;
    static getByBriefingId(briefingId: string): Promise<CopyDeliverable | null>;
    static getByClientId(clientId: string): Promise<CopyDeliverable[]>;
    static update(id: string, data: Partial<unknown>): Promise<CopyDeliverable>;
    static delete(id: string): Promise<void>;
}
declare const _default: {
    ClientRepository: typeof ClientRepository;
    BriefingRepository: typeof BriefingRepository;
    BrandProfileRepository: typeof BrandProfileRepository;
    DeliverableRepository: typeof DeliverableRepository;
};
export default _default;
//# sourceMappingURL=index.d.ts.map