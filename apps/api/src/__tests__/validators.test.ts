import {
  createCampaignSchema,
  createDonationSchema,
  createCommentSchema,
  createReportSchema,
  createWithdrawalSchema,
  updateProfileSchema,
  submitVerificationSchema,
} from '../validators/schemas';

describe('Campaign Validation', () => {
  it('accepts valid campaign data', () => {
    const result = createCampaignSchema.safeParse({
      body: {
        title: 'Help Build a School',
        description: 'This campaign aims to build a school for underprivileged children in the area.',
        story: 'We have been working with the local community for years and have identified a critical need for educational infrastructure.',
        category: 'education',
        goal: 25000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects campaign with empty title', () => {
    const result = createCampaignSchema.safeParse({
      body: {
        title: '',
        description: 'Test description that is definitely long enough for validation',
        story: 'Test story that is definitely long enough to pass the 50 char validation requirement.',
        category: 'education',
        goal: 1000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects campaign with zero goal', () => {
    const result = createCampaignSchema.safeParse({
      body: {
        title: 'Test Campaign Title',
        description: 'Test description that is definitely long enough for validation',
        story: 'Test story that is definitely long enough to pass the 50 char validation requirement.',
        category: 'education',
        goal: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('Donation Validation', () => {
  it('accepts valid donation', () => {
    const result = createDonationSchema.safeParse({
      body: {
        campaignId: '507f1f77bcf86cd799439011',
        amount: 50,
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts donation with optional fields', () => {
    const result = createDonationSchema.safeParse({
      body: {
        campaignId: '507f1f77bcf86cd799439011',
        amount: 100,
        message: 'Keep up the great work!',
        anonymous: true,
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects donation with zero amount', () => {
    const result = createDonationSchema.safeParse({
      body: {
        campaignId: '507f1f77bcf86cd799439011',
        amount: 0,
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('Comment Validation', () => {
  it('accepts valid comment', () => {
    const result = createCommentSchema.safeParse({
      body: {
        campaignId: '507f1f77bcf86cd799439011',
        content: 'This is a great campaign!',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty comment', () => {
    const result = createCommentSchema.safeParse({
      body: {
        campaignId: '507f1f77bcf86cd799439011',
        content: '',
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('Report Validation', () => {
  it('accepts valid report', () => {
    const result = createReportSchema.safeParse({
      body: {
        targetType: 'campaign',
        targetId: '507f1f77bcf86cd799439011',
        reason: 'fraud',
        description: 'This campaign appears to be fraudulent.',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects report with invalid reason', () => {
    const result = createReportSchema.safeParse({
      body: {
        targetType: 'campaign',
        targetId: '507f1f77bcf86cd799439011',
        reason: 'invalid_reason',
        description: 'This is a test description for the report.',
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('Withdrawal Validation', () => {
  it('accepts valid withdrawal', () => {
    const result = createWithdrawalSchema.safeParse({
      body: {
        campaignId: '507f1f77bcf86cd799439011',
        amount: 500,
        bankName: 'Chase Bank',
        accountNumber: '123456789',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects withdrawal with zero amount', () => {
    const result = createWithdrawalSchema.safeParse({
      body: {
        campaignId: '507f1f77bcf86cd799439011',
        amount: 0,
        bankName: 'Chase Bank',
        accountNumber: '123456789',
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('Profile Validation', () => {
  it('accepts valid profile update', () => {
    const result = updateProfileSchema.safeParse({
      body: {
        name: 'John Doe',
        bio: 'Passionate fundraiser',
        location: 'New York',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty profile update', () => {
    const result = updateProfileSchema.safeParse({ body: {} });
    expect(result.success).toBe(true);
  });
});

describe('Verification Validation', () => {
  it('accepts valid verification request', () => {
    const result = submitVerificationSchema.safeParse({
      body: { level: 'identity' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid verification level', () => {
    const result = submitVerificationSchema.safeParse({
      body: { level: 'invalid_level' },
    });
    expect(result.success).toBe(false);
  });
});
