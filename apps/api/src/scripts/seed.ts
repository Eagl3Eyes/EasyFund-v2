import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';
import { getFirebaseAdmin } from '../config/firebase';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'EasyFundDB';

const FORCE = process.argv.includes('--force');

const adminEmails = (process.env.ADMIN_EMAILS || 'admin@easyfund.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const adminEmail = adminEmails[0];

const DEMO_PASSWORD = 'password123';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// ─── SEED DATA ────────────────────────────────────────────

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

const users = [
  {
    _id: new ObjectId(),
    firebaseUid: 'seed-admin-001',
    email: adminEmail,
    name: 'Admin User',
    image: '',
    role: 'admin' as const,
    phone: '+1 (555) 100-0001',
    bio: 'Platform administrator for EasyFund. Ensuring safe and transparent crowdfunding for everyone.',
    location: 'San Francisco, CA',
    website: 'https://easyfund.com',
    verified: true,
    verificationLevel: 'full' as const,
    emailVerified: true,
    notificationPreferences: { emailNotifications: true, donationAlerts: true, campaignUpdates: true, marketingEmails: false },
    campaignCount: 0,
    totalRaised: 0,
    totalDonated: 250,
    savedCampaigns: [],
    createdAt: daysAgo(90),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    firebaseUid: 'seed-fundraiser-001',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    image: '',
    role: 'fundraiser' as const,
    phone: '+1 (555) 200-0001',
    bio: 'Passionate about education and healthcare. Running campaigns to make a difference in underserved communities.',
    location: 'New York, NY',
    website: '',
    verified: true,
    verificationLevel: 'identity' as const,
    emailVerified: true,
    notificationPreferences: { emailNotifications: true, donationAlerts: true, campaignUpdates: true, marketingEmails: false },
    campaignCount: 3,
    totalRaised: 125700,
    totalDonated: 500,
    savedCampaigns: [],
    createdAt: daysAgo(60),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    firebaseUid: 'seed-fundraiser-002',
    email: 'mike@example.com',
    name: 'Mike Chen',
    image: '',
    role: 'fundraiser' as const,
    phone: '+1 (555) 200-0002',
    bio: 'Environmental activist and fundraiser. Believer in clean water and sustainable futures for all.',
    location: 'Austin, TX',
    website: '',
    verified: true,
    verificationLevel: 'email' as const,
    emailVerified: true,
    notificationPreferences: { emailNotifications: true, donationAlerts: true, campaignUpdates: true, marketingEmails: true },
    campaignCount: 2,
    totalRaised: 33980,
    totalDonated: 150,
    savedCampaigns: [],
    createdAt: daysAgo(45),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    firebaseUid: 'seed-user-001',
    email: 'emily@example.com',
    name: 'Emily Davis',
    image: '',
    role: 'user' as const,
    phone: '',
    bio: 'Supporting causes I believe in. Every small donation counts!',
    location: 'Chicago, IL',
    website: '',
    verified: true,
    verificationLevel: 'email' as const,
    emailVerified: true,
    notificationPreferences: { emailNotifications: true, donationAlerts: true, campaignUpdates: true, marketingEmails: false },
    campaignCount: 0,
    totalRaised: 0,
    totalDonated: 1250,
    savedCampaigns: [],
    createdAt: daysAgo(30),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    firebaseUid: 'seed-user-002',
    email: 'james@example.com',
    name: 'James Wilson',
    image: '',
    role: 'user' as const,
    phone: '',
    bio: 'Tech professional who wants to give back. Supporting education and environment campaigns.',
    location: 'Seattle, WA',
    website: '',
    verified: false,
    verificationLevel: 'none' as const,
    emailVerified: false,
    notificationPreferences: { emailNotifications: true, donationAlerts: true, campaignUpdates: false, marketingEmails: false },
    campaignCount: 0,
    totalRaised: 0,
    totalDonated: 375,
    savedCampaigns: [],
    createdAt: daysAgo(15),
    updatedAt: now,
  },
];

const categories = [
  { name: 'Education', slug: 'education', icon: 'book-open', description: 'Support educational initiatives', campaignCount: 1, color: '#3B82F6' },
  { name: 'Medical', slug: 'medical', icon: 'heart-pulse', description: 'Healthcare and medical causes', campaignCount: 1, color: '#EF4444' },
  { name: 'Environment', slug: 'environment', icon: 'leaf', description: 'Environmental conservation', campaignCount: 1, color: '#22C55E' },
  { name: 'Community', slug: 'community', icon: 'users', description: 'Community development projects', campaignCount: 1, color: '#10B981' },
  { name: 'Disaster Relief', slug: 'disaster-relief', icon: 'siren', description: 'Disaster relief and emergency aid', campaignCount: 1, color: '#F59E0B' },
  { name: 'Technology', slug: 'technology', icon: 'cpu', description: 'Technology and innovation', campaignCount: 1, color: '#6366F1' },
];

const campaigns = [
  {
    _id: new ObjectId(),
    slug: 'build-a-school-in-rural-india',
    title: 'Build a School in Rural India',
    description: 'Help us build a school for 500 children in rural India who currently walk 10km to attend classes.',
    story: 'In the remote villages of Rajasthan, India, children walk over 10 kilometers each way to attend the nearest school. Many drop out by age 12. We want to build a modern school with classrooms, a library, and a computer lab right in the village center. This will serve over 500 children and transform the entire community.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    category: 'Education',
    location: 'Rajasthan, India',
    status: 'published',
    goal: 50000,
    amountRaised: 32500,
    supportersCount: 148,
    deadline: daysAgo(-60),
    fundraiserId: users[1]._id.toString(),
    fundraiserName: 'Sarah Johnson',
    fundraiserImage: '',
    fundraiserVerified: true,
    beneficiaryType: 'others',
    milestones: [],
    updatesCount: 2,
    commentsCount: 5,
    riskScore: 0,
    reportCount: 0,
    featured: true,
    trending: true,
    createdAt: daysAgo(30),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    slug: 'help-children-fight-cancer',
    title: 'Help Children Fight Cancer',
    description: 'Supporting children battling cancer with treatment, nutrition, and emotional support.',
    story: 'Every year, thousands of children are diagnosed with cancer. Families struggle to afford treatment. We partner with childrens hospitals to cover treatment costs, provide nutrition packs, and offer counseling services. Your donation directly saves lives.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    category: 'Medical',
    location: 'Boston, MA',
    status: 'published',
    goal: 100000,
    amountRaised: 78200,
    supportersCount: 312,
    deadline: daysAgo(-45),
    fundraiserId: users[1]._id.toString(),
    fundraiserName: 'Sarah Johnson',
    fundraiserImage: '',
    fundraiserVerified: true,
    beneficiaryType: 'others',
    milestones: [],
    updatesCount: 3,
    commentsCount: 12,
    riskScore: 0,
    reportCount: 0,
    featured: true,
    trending: true,
    createdAt: daysAgo(25),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    slug: 'clean-water-for-african-villages',
    title: 'Clean Water for African Villages',
    description: 'Providing clean drinking water to 10 villages in sub-Saharan Africa through well drilling.',
    story: 'Over 780 million people worldwide lack access to clean water. We are drilling wells in 10 villages across Kenya and Uganda. Each well provides water for up to 500 people and lasts for 20+ years. Clean water means healthier children, more time for education, and economic growth.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    category: 'Community',
    location: 'Nairobi, Kenya',
    status: 'published',
    goal: 25000,
    amountRaised: 18750,
    supportersCount: 89,
    deadline: daysAgo(-30),
    fundraiserId: users[2]._id.toString(),
    fundraiserName: 'Mike Chen',
    fundraiserImage: '',
    fundraiserVerified: true,
    beneficiaryType: 'others',
    milestones: [],
    updatesCount: 1,
    commentsCount: 3,
    riskScore: 0,
    reportCount: 0,
    featured: false,
    trending: true,
    createdAt: daysAgo(20),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    slug: 'save-our-rainforests',
    title: 'Save Our Rainforests',
    description: 'Protecting 1,000 acres of Amazon rainforest from deforestation through land purchase.',
    story: 'The Amazon rainforest is being destroyed at an alarming rate. We are purchasing 1,000 acres of critical rainforest habitat to permanently protect it. This land is home to over 200 species of birds, 50 species of mammals, and countless insects. Once purchased, the land will be managed as a nature reserve in perpetuity.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    category: 'Environment',
    location: 'Amazon Basin, Brazil',
    status: 'active',
    goal: 40000,
    amountRaised: 15230,
    supportersCount: 112,
    deadline: daysAgo(-40),
    fundraiserId: users[2]._id.toString(),
    fundraiserName: 'Mike Chen',
    fundraiserImage: '',
    fundraiserVerified: true,
    beneficiaryType: 'others',
    milestones: [],
    updatesCount: 0,
    commentsCount: 2,
    riskScore: 0,
    reportCount: 0,
    featured: false,
    trending: false,
    createdAt: daysAgo(15),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    slug: 'community-food-bank-expansion',
    title: 'Community Food Bank Expansion',
    description: 'Expanding our food bank to serve 2x more families in need across the tri-state area.',
    story: 'Our food bank has been serving the community for 5 years. We have outgrown our current space and need to expand to a larger facility. This will allow us to serve 2,000 families per month instead of 1,000. We will also add a commercial kitchen for hot meal preparation.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    category: 'Community',
    location: 'Hartford, CT',
    status: 'completed',
    goal: 15000,
    amountRaised: 15000,
    supportersCount: 67,
    deadline: daysAgo(5),
    fundraiserId: users[1]._id.toString(),
    fundraiserName: 'Sarah Johnson',
    fundraiserImage: '',
    fundraiserVerified: true,
    beneficiaryType: 'self',
    milestones: [],
    updatesCount: 4,
    commentsCount: 8,
    riskScore: 0,
    reportCount: 0,
    featured: false,
    trending: false,
    createdAt: daysAgo(60),
    updatedAt: now,
  },
  {
    _id: new ObjectId(),
    slug: 'emergency-disaster-relief-fund',
    title: 'Emergency Disaster Relief Fund',
    description: 'Providing immediate relief to communities affected by natural disasters worldwide.',
    story: 'Natural disasters strike without warning. Our emergency relief fund provides immediate shelter, food, water, and medical supplies to affected communities. We work with local organizations on the ground to ensure aid reaches those who need it most. Every dollar goes directly to disaster survivors.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    category: 'Disaster Relief',
    location: 'Global',
    status: 'submitted',
    goal: 75000,
    amountRaised: 0,
    supportersCount: 0,
    deadline: daysAgo(-90),
    fundraiserId: users[2]._id.toString(),
    fundraiserName: 'Mike Chen',
    fundraiserImage: '',
    fundraiserVerified: true,
    beneficiaryType: 'others',
    milestones: [],
    updatesCount: 0,
    commentsCount: 0,
    riskScore: 0,
    reportCount: 0,
    featured: false,
    trending: false,
    createdAt: daysAgo(3),
    updatedAt: now,
  },
];

const donations = [
  {
    _id: new ObjectId(),
    campaignId: campaigns[0]._id.toString(),
    campaignTitle: campaigns[0].title,
    campaignImage: campaigns[0].image,
    fundraiserName: 'Sarah Johnson',
    userId: users[3]._id.toString(),
    userName: 'Emily Davis',
    userEmail: 'emily@example.com',
    amount: 100,
    currency: 'USD',
    anonymous: false,
    message: 'Great cause! Education changes lives.',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(20),
  },
  {
    _id: new ObjectId(),
    campaignId: campaigns[0]._id.toString(),
    campaignTitle: campaigns[0].title,
    campaignImage: campaigns[0].image,
    fundraiserName: 'Sarah Johnson',
    userId: users[4]._id.toString(),
    userName: 'James Wilson',
    userEmail: 'james@example.com',
    amount: 250,
    currency: 'USD',
    anonymous: false,
    message: 'Happy to support this!',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(18),
  },
  {
    _id: new ObjectId(),
    campaignId: campaigns[1]._id.toString(),
    campaignTitle: campaigns[1].title,
    campaignImage: campaigns[1].image,
    fundraiserName: 'Sarah Johnson',
    userId: users[3]._id.toString(),
    userName: 'Emily Davis',
    userEmail: 'emily@example.com',
    amount: 500,
    currency: 'USD',
    anonymous: false,
    message: 'For all the brave kids fighting cancer.',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(15),
  },
  {
    _id: new ObjectId(),
    campaignId: campaigns[1]._id.toString(),
    campaignTitle: campaigns[1].title,
    campaignImage: campaigns[1].image,
    fundraiserName: 'Sarah Johnson',
    userId: users[4]._id.toString(),
    userName: 'James Wilson',
    userEmail: 'james@example.com',
    amount: 75,
    currency: 'USD',
    anonymous: true,
    message: '',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(12),
  },
  {
    _id: new ObjectId(),
    campaignId: campaigns[2]._id.toString(),
    campaignTitle: campaigns[2].title,
    campaignImage: campaigns[2].image,
    fundraiserName: 'Mike Chen',
    userId: users[3]._id.toString(),
    userName: 'Emily Davis',
    userEmail: 'emily@example.com',
    amount: 50,
    currency: 'USD',
    anonymous: false,
    message: 'Clean water is a human right.',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(10),
  },
  {
    _id: new ObjectId(),
    campaignId: campaigns[3]._id.toString(),
    campaignTitle: campaigns[3].title,
    campaignImage: campaigns[3].image,
    fundraiserName: 'Mike Chen',
    userId: users[0]._id.toString(),
    userName: 'Admin User',
    userEmail: adminEmail,
    amount: 250,
    currency: 'USD',
    anonymous: false,
    message: 'Protecting the Amazon is critical for our planet.',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(8),
  },
  {
    _id: new ObjectId(),
    campaignId: campaigns[4]._id.toString(),
    campaignTitle: campaigns[4].title,
    campaignImage: campaigns[4].image,
    fundraiserName: 'Sarah Johnson',
    userId: users[4]._id.toString(),
    userName: 'James Wilson',
    userEmail: 'james@example.com',
    amount: 50,
    currency: 'USD',
    anonymous: false,
    message: 'Everyone deserves to eat.',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(25),
  },
  {
    _id: new ObjectId(),
    campaignId: campaigns[0]._id.toString(),
    campaignTitle: campaigns[0].title,
    campaignImage: campaigns[0].image,
    fundraiserName: 'Sarah Johnson',
    userId: users[0]._id.toString(),
    userName: 'Admin User',
    userEmail: adminEmail,
    amount: 100,
    currency: 'USD',
    anonymous: false,
    message: 'Supporting education in rural areas.',
    status: 'completed',
    transactionId: `txn_${new ObjectId().toString().slice(0, 12)}`,
    createdAt: daysAgo(5),
  },
];

const notifications = [
  {
    _id: new ObjectId(),
    userId: users[0]._id.toString(),
    type: 'welcome',
    title: 'Welcome to EasyFund!',
    message: 'Your account has been set up as an admin. You now have full access to the platform management tools.',
    read: false,
    createdAt: daysAgo(90),
  },
  {
    _id: new ObjectId(),
    userId: users[0]._id.toString(),
    type: 'donation',
    title: 'New Donation Received',
    message: 'Admin User donated $250 to Save Our Rainforests.',
    read: false,
    createdAt: daysAgo(8),
  },
  {
    _id: new ObjectId(),
    userId: users[1]._id.toString(),
    type: 'campaign_milestone',
    title: 'Campaign Milestone Reached!',
    message: 'Help Children Fight Cancer has reached 75% of its goal!',
    read: true,
    createdAt: daysAgo(10),
  },
  {
    _id: new ObjectId(),
    userId: users[1]._id.toString(),
    type: 'donation',
    title: 'New Donation',
    message: 'Emily Davis donated $500 to Help Children Fight Cancer.',
    read: false,
    createdAt: daysAgo(15),
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log(`\n  EasyFund Seed Script`);
    console.log(`  Database: ${DB_NAME}`);
    console.log(`  Admin emails: ${adminEmails.join(', ')}\n`);

    if (!FORCE) {
      const userCount = await db.collection('users').countDocuments();
      if (userCount > 0) {
        const proceed = await confirm(
          `⚠️  ${userCount} user(s) already exist. This will REPLACE all data. Continue?`
        );
        if (!proceed) {
          console.log('Seed cancelled.');
          return;
        }
      }
    }

    console.log('\n🗑️  Dropping existing collections...');
    const collections = [
      'users', 'campaigns', 'donations', 'categories', 'notifications',
      'comments', 'campaign_updates', 'withdrawals', 'verification_requests',
      'saved_campaigns', 'follows', 'audit_logs', 'reports', 'payment_webhooks',
    ];
    for (const name of collections) {
      await db.collection(name).drop().catch(() => {});
    }

    console.log('\n🔥 Creating Firebase Auth accounts...');
    const firebaseApp = getFirebaseAdmin();
    const uidMap = new Map<string, string>();

    for (const user of users) {
      try {
        const userRecord = await firebaseApp.auth().createUser({
          email: user.email,
          password: DEMO_PASSWORD,
          displayName: user.name,
          emailVerified: true,
        });
        uidMap.set(user.firebaseUid, userRecord.uid);
        console.log(`   ✓ Created Firebase account: ${user.email} (${userRecord.uid})`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          const existing = await firebaseApp.auth().getUserByEmail(user.email);
          uidMap.set(user.firebaseUid, existing.uid);
          console.log(`   ℹ Firebase account already exists: ${user.email} (${existing.uid})`);
        } else {
          console.error(`   ✗ Failed to create Firebase account for ${user.email}:`, error.message);
        }
      }
    }

    for (const user of users) {
      const realUid = uidMap.get(user.firebaseUid);
      if (realUid) {
        user.firebaseUid = realUid;
      }
    }

    console.log('👤 Seeding users...');
    await db.collection('users').insertMany(users);
    console.log(`   ✓ ${users.length} users created`);

    console.log('📂 Seeding categories...');
    await db.collection('categories').insertMany(categories);
    console.log(`   ✓ ${categories.length} categories created`);

    console.log('📢 Seeding campaigns...');
    await db.collection('campaigns').insertMany(campaigns);
    console.log(`   ✓ ${campaigns.length} campaigns created`);

    console.log('💰 Seeding donations...');
    await db.collection('donations').insertMany(donations);
    console.log(`   ✓ ${donations.length} donations created`);

    console.log('🔔 Seeding notifications...');
    await db.collection('notifications').insertMany(notifications);
    console.log(`   ✓ ${notifications.length} notifications created`);

    console.log('📊 Creating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ firebaseUid: 1 });
    await db.collection('users').createIndex({ role: 1 });

    await db.collection('campaigns').createIndex({ slug: 1 }, { unique: true });
    await db.collection('campaigns').createIndex({ status: 1, createdAt: -1 });
    await db.collection('campaigns').createIndex({ fundraiserId: 1 });
    await db.collection('campaigns').createIndex({ category: 1 });
    await db.collection('campaigns').createIndex({ featured: 1 });
    await db.collection('campaigns').createIndex({ title: 'text', description: 'text', story: 'text' });

    await db.collection('donations').createIndex({ campaignId: 1, createdAt: -1 });
    await db.collection('donations').createIndex({ userId: 1 });
    await db.collection('donations').createIndex({ status: 1 });

    await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('comments').createIndex({ campaignId: 1 });
    await db.collection('campaign_updates').createIndex({ campaignId: 1 });
    await db.collection('withdrawals').createIndex({ fundraiserId: 1 });
    await db.collection('verification_requests').createIndex({ userId: 1 });
    await db.collection('reports').createIndex({ reporterId: 1 });
    await db.collection('audit_logs').createIndex({ action: 1 });
    await db.collection('saved_campaigns').createIndex({ userId: 1, campaignId: 1 }, { unique: true });
    await db.collection('follows').createIndex({ followerId: 1 });
    console.log('   ✓ Indexes created');

    console.log('\n✅ Seed completed successfully!\n');
    console.log('  Test accounts:');
    console.log('  ─────────────────────────────────────────');
    console.log(`  🔐 Admin:     ${adminEmail} (role: admin)`);
    console.log('  📢 Fundraiser: sarah@example.com (role: fundraiser)');
    console.log('  📢 Fundraiser: mike@example.com (role: fundraiser)');
    console.log('  ❤️  Donor:     emily@example.com (role: user)');
    console.log('  ❤️  Donor:     james@example.com (role: user)');
    console.log('  ─────────────────────────────────────────');
    console.log(`  🔑 Password for all accounts: ${DEMO_PASSWORD}\n`);
    console.log('  These accounts are ready to use — Firebase Auth + MongoDB are synced.\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
