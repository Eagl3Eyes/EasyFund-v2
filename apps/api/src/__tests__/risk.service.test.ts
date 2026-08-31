import { RiskService } from '../services/risk.service';

jest.mock('../config/database', () => ({
  campaigns: jest.fn(() => ({
    findOne: jest.fn().mockResolvedValue(null),
    countDocuments: jest.fn().mockResolvedValue(0),
  })),
  users: jest.fn(() => ({
    findOne: jest.fn().mockResolvedValue({
      _id: 'user1',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    }),
  })),
}));

describe('RiskService', () => {
  const service = new RiskService();

  const baseData = {
    fundraiserId: 'user1',
    title: 'Help Build a School',
    description: 'This campaign aims to build a school for underprivileged children in rural areas.',
    story: 'We have been working with the local community for years and have identified a critical need for educational infrastructure. The funds will be used to construct a two-story building with classrooms, a library, and computer lab.',
    goal: 25000,
    category: 'education',
    beneficiaryType: 'community',
  };

  it('returns low risk for a well-formed campaign', async () => {
    const result = await service.assessCampaign(baseData);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(30);
    expect(result.level).toBe('low');
    expect(Array.isArray(result.signals)).toBe(true);
  });

  it('flags high goal as elevated risk', async () => {
    const result = await service.assessCampaign({ ...baseData, goal: 75000 });
    const highGoalSignal = result.signals.find(s => s.name === 'elevated_goal');
    expect(highGoalSignal).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
  });

  it('flags very high goal as higher risk', async () => {
    const result = await service.assessCampaign({ ...baseData, goal: 150000 });
    const highGoalSignal = result.signals.find(s => s.name === 'high_goal');
    expect(highGoalSignal).toBeDefined();
  });

  it('flags high-risk category', async () => {
    const result = await service.assessCampaign({ ...baseData, category: 'emergency' });
    const categorySignal = result.signals.find(s => s.name === 'high_risk_category');
    expect(categorySignal).toBeDefined();
  });

  it('flags short description', async () => {
    const result = await service.assessCampaign({ ...baseData, description: 'Short' });
    const descSignal = result.signals.find(s => s.name === 'short_description');
    expect(descSignal).toBeDefined();
  });

  it('flags short story', async () => {
    const result = await service.assessCampaign({ ...baseData, story: 'Short story.' });
    const storySignal = result.signals.find(s => s.name === 'short_story');
    expect(storySignal).toBeDefined();
  });

  it('flags third-party beneficiary', async () => {
    const result = await service.assessCampaign({ ...baseData, beneficiaryType: 'someone_else' });
    const thirdPartySignal = result.signals.find(s => s.name === 'third_party_beneficiary');
    expect(thirdPartySignal).toBeDefined();
  });

  it('caps score at 100', async () => {
    const result = await service.assessCampaign({
      ...baseData,
      goal: 200000,
      category: 'emergency',
      description: 'Hi',
      story: 'Short',
      beneficiaryType: 'someone_else',
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('assigns correct risk levels', async () => {
    const lowResult = await service.assessCampaign(baseData);
    expect(lowResult.level).toBe('low');

    const highResult = await service.assessCampaign({
      ...baseData,
      goal: 200000,
      category: 'emergency',
      description: 'Hi',
      story: 'Short',
      beneficiaryType: 'someone_else',
    });
    // With multiple signals, should be medium or high
    expect(['medium', 'high']).toContain(highResult.level);
  });
});
