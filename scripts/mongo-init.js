// MongoDB Initialization Script for AI Study Assistant
// Automatically executed by MongoDB Docker container on first launch

const dbName = process.env.MONGODB_DATABASE || 'ai-study-assistant';
const username = process.env.MONGODB_USER || 'study_user';
const password = process.env.MONGODB_PASSWORD || 'study_secure_password';

const adminDb = db.getSiblingDB('admin');
const appDb = db.getSiblingDB(dbName);

// Create application user with readWrite on application database
adminDb.createUser({
  user: username,
  pwd: password,
  roles: [
    { role: 'readWrite', db: dbName },
    { role: 'read', db: 'admin' }
  ]
});

// Initialize collections and essential indexes
appDb.createCollection('users');
appDb.createCollection('studysessions');
appDb.createCollection('messages');
appDb.createCollection('generatedcontents');

appDb.users.createIndex({ email: 1 }, { unique: true });
appDb.studysessions.createIndex({ userId: 1, createdAt: -1 });
appDb.studysessions.createIndex({ userId: 1, type: 1 });
appDb.messages.createIndex({ sessionId: 1, createdAt: 1 });
appDb.messages.createIndex({ userId: 1, createdAt: -1 });
appDb.generatedcontents.createIndex({ userId: 1, createdAt: -1 });
appDb.generatedcontents.createIndex({ userId: 1, type: 1 });

print(`MongoDB initialized successfully for ${dbName} with user ${username}`);
