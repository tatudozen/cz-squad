// Seed Database with Test Data
// Story 1.2: Supabase Schema & Client Data Layer

import { ClientRepository, BriefingRepository, BrandProfileRepository } from '../packages/shared/src/repositories/index.js';

const TEST_DATA = {
  clients: [
    {
      name: 'Clínica Silva',
      segment: 'health',
      contact_email: 'contato@clinicasilva.com.br',
      contact_phone: '+55 11 98765-4321',
      owner_name: 'Dr. Silva',
    },
  ],
  briefings: [
    {
      business_name: 'Clínica Silva',
      segment: 'health',
      target_audience: 'Mulheres 30-50, consultoras imobiliárias na região de São Paulo',
      voice_tone: 'consultivo, profissional, educativo',
      objectives: ['Gerar leads qualificados', 'Aumentar presença online', 'Estabelecer autoridade'],
      differentiators:
        'Abordagem personalisada, atendimento humanizado, 20 anos de experiência',
      existing_colors: ['#06164A', '#6220FF', '#ED145B'],
      monthly_budget: 2000,
    },
  ],
  brandProfiles: [
    {
      color_palette: {
        primary: '#06164A',
        secondary: '#6220FF',
        accent: '#ED145B',
        neutral: '#A1C8F7',
      },
      voice_guidelines: {
        tone: 'Consultivo, profissional, acessível',
        keywords_to_use: ['transformação', 'confiança', 'bem-estar', 'inovação'],
        keywords_to_avoid: ['agressivo', 'invasivo', 'técnico demais'],
        example_phrases: [
          'Sua saúde é nossa prioridade',
          'Transformamos vidas através da medicina integrativa',
          'Confiança, cuidado, resultado',
        ],
      },
      visual_style: 'moderno, limpo, acessível',
      font_recommendations: {
        heading: 'Muli',
        body: 'Lato',
      },
    },
  ],
};

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test data...\n');

    // 1. Create test client
    console.log('📋 Creating clients...');
    const clientData = TEST_DATA.clients[0];
    const client = await ClientRepository.create(clientData);
    console.log(`✅ Client created: ${client.id}`);

    // 2. Create test briefing
    console.log('\n📝 Creating briefings...');
    const briefingData = {
      ...TEST_DATA.briefings[0],
      client_id: client.id,
    };
    const briefing = await BriefingRepository.create(briefingData);
    console.log(`✅ Briefing created: ${briefing.id}`);

    // 3. Approve briefing
    console.log('\n✔️ Approving briefing...');
    const approvedBriefing = await BriefingRepository.approve(briefing.id, 'seed-script');
    console.log(`✅ Briefing approved`);

    // 4. Create brand profile
    console.log('\n🎨 Creating brand profile...');
    const profileData = {
      ...TEST_DATA.brandProfiles[0],
      client_id: client.id,
      briefing_id: approvedBriefing.id,
    };
    const profile = await BrandProfileRepository.create(profileData);
    console.log(`✅ Brand profile created: ${profile.id}`);

    console.log('\n✨ Database seeding complete!\n');
    console.log('Test Data Summary:');
    console.log(`  - Client: ${client.name} (${client.id})`);
    console.log(`  - Briefing: ${briefing.business_name} (${briefing.id})`);
    console.log(`  - Brand Profile: (${profile.id})`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
