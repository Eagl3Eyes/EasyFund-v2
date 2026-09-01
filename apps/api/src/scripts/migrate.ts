import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'EasyFundDB';

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log(`Starting migration on database: ${DB_NAME}`);

    // ============================================
    // 1. Migrate 'classes' → 'campaigns'
    // ============================================
    const classesCollection = db.collection('classes');
    const campaignsCollection = db.collection('campaigns');

    const classesCount = await classesCollection.countDocuments();
    console.log(`Found ${classesCount} documents in 'classes'`);

    if (classesCount > 0) {
      // Check if campaigns already has data
      const campaignsCount = await campaignsCollection.countDocuments();

      if (campaignsCount === 0) {
        console.log('Migrating classes → campaigns...');

        const classes = await classesCollection.find({}).toArray();

        for (const cls of classes) {
          const campaign = {
            _id: cls._id,
            slug: generateSlug(cls.name || 'untitled'),
            title: cls.name || 'Untitled Campaign',
            description: cls.description || '',
            story: cls.description || '',
            image: cls.image || '',
            gallery: [],
            category: 'general',
            location: '',
            status: mapCampaignStatus(cls.status),
            goal: cls.availableSeats || 0, // availableSeats = goal
            amountRaised: (cls.enrolled || 0) * (cls.price || 0),
            supportersCount: cls.enrolled || 0,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            fundraiserId: '',
            fundraiserName: cls.instructor || '',
            fundraiserImage: '',
            fundraiserVerified: false,
            beneficiaryType: 'self',
            milestones: [],
            updatesCount: 0,
            commentsCount: 0,
            riskScore: 0,
            reportCount: 0,
            featured: false,
            trending: false,
            createdAt: cls.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await campaignsCollection.insertOne(campaign);
        }

        console.log(`Migrated ${classes.length} documents to 'campaigns'`);
      } else {
        console.log('Campaigns collection already has data, skipping migration');
      }
    }

    // ============================================
    // 2. Migrate 'payments' → 'donations'
    // ============================================
    const paymentsCollection = db.collection('payments');
    const donationsCollection = db.collection('donations');

    const paymentsCount = await paymentsCollection.countDocuments();
    console.log(`Found ${paymentsCount} documents in 'payments'`);

    if (paymentsCount > 0) {
      const donationsCount = await donationsCollection.countDocuments();

      if (donationsCount === 0) {
        console.log('Migrating payments → donations...');

        const payments = await paymentsCollection.find({}).toArray();

        for (const payment of payments) {
          const donation = {
            _id: payment._id,
            campaignId: payment._id || '',
            campaignTitle: payment.lecture?.name || '',
            campaignImage: payment.lecture?.image || '',
            fundraiserName: payment.lecture?.instructor || '',
            userId: '',
            userName: '',
            userEmail: payment.email || '',
            amount: payment.price || 0,
            currency: 'USD',
            anonymous: false,
            message: '',
            status: payment.status === 'service pending' ? 'completed' : payment.status,
            transactionId: payment.transactionId || '',
            createdAt: payment.date || new Date().toISOString(),
          };

          await donationsCollection.insertOne(donation);
        }

        console.log(`Migrated ${payments.length} documents to 'donations'`);
      } else {
        console.log('Donations collection already has data, skipping migration');
      }
    }

    // ============================================
    // 3. Migrate 'verification' → 'verification_requests'
    // ============================================
    const verificationCollection = db.collection('verification');
    const verificationRequestsCollection = db.collection('verification_requests');

    const verificationCount = await verificationCollection.countDocuments();
    console.log(`Found ${verificationCount} documents in 'verification'`);

    if (verificationCount > 0) {
      const verReqCount = await verificationRequestsCollection.countDocuments();

      if (verReqCount === 0) {
        console.log('Migrating verification → verification_requests...');

        const verifications = await verificationCollection.find({}).toArray();

        for (const ver of verifications) {
          const verificationRequest = {
            _id: ver._id,
            userId: '',
            userName: ver.name || '',
            userEmail: ver.email || '',
            level: 'identity',
            fullName: ver.name || '',
            idDocumentType: 'national_id',
            idDocumentNumber: ver.idCardNumber || '',
            phone: ver.phoneNumber || '',
            status: ver.status || 'pending',
            createdAt: new Date().toISOString(),
          };

          await verificationRequestsCollection.insertOne(verificationRequest);
        }

        console.log(`Migrated ${verifications.length} documents to 'verification_requests'`);
      } else {
        console.log('verification_requests already has data, skipping migration');
      }
    }

    // ============================================
    // 4. Rename 'classesCart' → keep as is for now
    // ============================================
    console.log('Note: classesCart collection preserved for backward compatibility');

    // ============================================
    // 5. Add indexes
    // ============================================
    console.log('Creating indexes...');

    await campaignsCollection.createIndex({ slug: 1 }, { unique: true });
    await campaignsCollection.createIndex({ status: 1 });
    await campaignsCollection.createIndex({ category: 1 });
    await campaignsCollection.createIndex({ createdAt: -1 });
    await campaignsCollection.createIndex({ goal: 1 });
    await campaignsCollection.createIndex({ amountRaised: -1 });
    await campaignsCollection.createIndex({ fundraiserId: 1 });
    await campaignsCollection.createIndex({ fundraiserId: 1, status: 1 });
    await campaignsCollection.createIndex({ title: 'text', description: 'text', story: 'text' });

    await donationsCollection.createIndex({ userEmail: 1 });
    await donationsCollection.createIndex({ campaignId: 1 });
    await donationsCollection.createIndex({ createdAt: -1 });
    await donationsCollection.createIndex({ userId: 1 });
    await donationsCollection.createIndex({ status: 1 });
    await donationsCollection.createIndex({ transactionId: 1 });

    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ firebaseUid: 1 });
    await db.collection('users').createIndex({ role: 1 });

    await db.collection('withdrawals').createIndex({ fundraiserId: 1 });
    await db.collection('withdrawals').createIndex({ status: 1 });
    await db.collection('withdrawals').createIndex({ createdAt: -1 });

    await db.collection('comments').createIndex({ campaignId: 1 });
    await db.collection('comments').createIndex({ parentCommentId: 1 });

    await db.collection('campaign_updates').createIndex({ campaignId: 1 });

    await db.collection('follows').createIndex({ followerId: 1 });
    await db.collection('follows').createIndex({ followingId: 1 });

    await db.collection('notifications').createIndex({ userId: 1, read: 1 });
    await db.collection('notifications').createIndex({ createdAt: -1 });

    await db.collection('saved_campaigns').createIndex({ userId: 1, campaignId: 1 }, { unique: true });

    await db.collection('verification_requests').createIndex({ userId: 1 });

    await db.collection('reports').createIndex({ reporterId: 1 });
    await db.collection('reports').createIndex({ status: 1 });

    await db.collection('audit_logs').createIndex({ action: 1 });
    await db.collection('audit_logs').createIndex({ createdAt: -1 });

    await db.collection('payment_webhooks').createIndex({ stripeEventId: 1 }, { unique: true });

    console.log('Indexes created');

    // ============================================
    // 6. Create default categories
    // ============================================
    const categoriesCollection = db.collection('categories');
    const categoriesCount = await categoriesCollection.countDocuments();

    if (categoriesCount === 0) {
      console.log('Creating default categories...');

      const defaultCategories = [
        { name: 'Education', slug: 'education', icon: 'book-open', description: 'Support educational initiatives', campaignCount: 0, color: '#3B82F6' },
        { name: 'Health', slug: 'health', icon: 'heart-pulse', description: 'Healthcare and medical causes', campaignCount: 0, color: '#EF4444' },
        { name: 'Community', slug: 'community', icon: 'users', description: 'Community development projects', campaignCount: 0, color: '#10B981' },
        { name: 'Emergency', slug: 'emergency', icon: 'siren', description: 'Disaster relief and emergency aid', campaignCount: 0, color: '#F59E0B' },
        { name: 'Environment', slug: 'environment', icon: 'leaf', description: 'Environmental conservation', campaignCount: 0, color: '#22C55E' },
        { name: 'Arts & Culture', slug: 'arts-culture', icon: 'palette', description: 'Arts, culture, and heritage', campaignCount: 0, color: '#8B5CF6' },
        { name: 'Sports', slug: 'sports', icon: 'trophy', description: 'Sports and recreation', campaignCount: 0, color: '#06B6D4' },
        { name: 'Technology', slug: 'technology', icon: 'cpu', description: 'Technology and innovation', campaignCount: 0, color: '#6366F1' },
        { name: 'Animals', slug: 'animals', icon: 'paw-print', description: 'Animal welfare and rescue', campaignCount: 0, color: '#D97706' },
        { name: 'Other', slug: 'other', icon: 'ellipsis', description: 'Other causes', campaignCount: 0, color: '#6B7280' },
      ];

      await categoriesCollection.insertMany(defaultCategories);
      console.log('Default categories created');
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapCampaignStatus(oldStatus: string): string {
  const statusMap: Record<string, string> = {
    pending: 'submitted',
    approved: 'active',
    deny: 'rejected',
  };
  return statusMap[oldStatus] || 'draft';
}

migrate();
