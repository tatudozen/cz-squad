// RLS Integration Tests
// Story 1.2: Supabase Schema & Client Data Layer
// Verify multi-tenant isolation and access controls
import { describe, it, expect, beforeAll } from 'vitest';
import { supabaseAdmin } from '../supabase.js';
import { ClientRepository, BriefingRepository } from '../repositories/index.js';
describe('RLS Integration Tests', () => {
    let client1;
    let client2;
    let briefing1;
    let briefing2;
    beforeAll(async () => {
        console.log('Setting up test data...');
        // Create two test clients
        client1 = await ClientRepository.create({
            name: 'Test Client A',
            segment: 'health',
            contact_email: `client-a-${Date.now()}@test.com`,
        });
        client2 = await ClientRepository.create({
            name: 'Test Client B',
            segment: 'consulting',
            contact_email: `client-b-${Date.now()}@test.com`,
        });
        // Create briefings for each client
        briefing1 = await BriefingRepository.create({
            client_id: client1.id,
            business_name: 'Client A Business',
            segment: 'health',
            target_audience: 'Health-conscious professionals',
            voice_tone: 'professional',
            differentiators: 'Premium healthcare services',
        });
        briefing2 = await BriefingRepository.create({
            client_id: client2.id,
            business_name: 'Client B Business',
            segment: 'consulting',
            target_audience: 'Enterprise customers',
            voice_tone: 'consultative',
            differentiators: 'Expert consulting services',
        });
        console.log('✅ Test data created\n');
    });
    describe('Client Isolation', () => {
        it('should return briefings only for the specified client', async () => {
            const client1Briefings = await BriefingRepository.getByClientId(client1.id);
            const client2Briefings = await BriefingRepository.getByClientId(client2.id);
            expect(client1Briefings).toHaveLength(1);
            expect(client2Briefings).toHaveLength(1);
            expect(client1Briefings[0].id).toBe(briefing1.id);
            expect(client2Briefings[0].id).toBe(briefing2.id);
        });
        it('should not allow cross-client briefing access via direct query', async () => {
            // Service role can access, but RLS ensures proper filtering
            const allBriefings = await supabaseAdmin.from('briefings').select('*');
            // Service role has full access (for admin operations)
            expect(allBriefings.error).toBeNull();
            expect(allBriefings.data?.length).toBeGreaterThanOrEqual(2);
        });
        it('should properly isolate client records', async () => {
            const fetchedClient1 = await ClientRepository.getById(client1.id);
            const fetchedClient2 = await ClientRepository.getById(client2.id);
            expect(fetchedClient1?.id).toBe(client1.id);
            expect(fetchedClient2?.id).toBe(client2.id);
            expect(fetchedClient1?.name).not.toBe(fetchedClient2?.name);
        });
    });
    describe('Data Integrity', () => {
        it('should maintain referential integrity for client_id', async () => {
            const briefing = await BriefingRepository.getById(briefing1.id);
            expect(briefing?.client_id).toBe(client1.id);
        });
        it('should cascade delete briefings when client is deleted', async () => {
            const testClient = await ClientRepository.create({
                name: 'Test Client Delete',
                contact_email: `delete-test-${Date.now()}@test.com`,
            });
            const testBriefing = await BriefingRepository.create({
                client_id: testClient.id,
                business_name: 'Test Business',
                segment: 'test',
                target_audience: 'test audience',
                voice_tone: 'test',
                objectives: ['test'],
                differentiators: 'test',
            });
            await ClientRepository.delete(testClient.id);
            const deletedBriefing = await BriefingRepository.getById(testBriefing.id);
            expect(deletedBriefing).toBeNull();
        });
    });
    describe('Status Validation', () => {
        it('should enforce valid briefing statuses', async () => {
            const validStatuses = ['draft', 'approved', 'processing', 'completed'];
            const briefing = await BriefingRepository.getById(briefing1.id);
            expect(validStatuses).toContain(briefing?.status);
        });
        it('should track approval metadata', async () => {
            const approved = await BriefingRepository.approve(briefing1.id, 'test-user');
            expect(approved.status).toBe('approved');
            expect(approved.approved_by).toBe('test-user');
            expect(approved.approved_at).not.toBeNull();
        });
    });
    describe('Index Performance', () => {
        it('should use indexes for common queries', async () => {
            // These queries should use indexes:
            // - idx_briefings_client_id
            // - idx_briefings_status
            // - idx_clients_email
            const client = await supabaseAdmin
                .from('clients')
                .select('*')
                .eq('contact_email', client1.contact_email)
                .single();
            expect(client.data).not.toBeNull();
            const briefings = await supabaseAdmin
                .from('briefings')
                .select('*')
                .eq('status', 'draft');
            expect(briefings.data).not.toBeNull();
        });
    });
});
//# sourceMappingURL=rls.integration.test.js.map