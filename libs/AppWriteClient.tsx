import { Account, Client, ID, Databases, Query, Storage } from 'appwrite';

// Check for required environment variables
const appwriteUrl = process.env.NEXT_PUBLIC_APPWRITE_URL;
const appwriteProjectId = process.env.NEXT_PUBLIC_ENDPOINT;

if (!appwriteUrl || !appwriteProjectId) {
    throw new Error('Missing Appwrite environment variables: NEXT_PUBLIC_APPWRITE_URL or NEXT_PUBLIC_ENDPOINT');
}

// Singleton instances - initialized lazily
let _client: Client | null = null;
let _account: Account | null = null;
let _database: Databases | null = null;
let _storage: Storage | null = null;

// Getter for the Client instance
const getClient = (): Client => {
    if (!_client) {
        console.log('Initializing Appwrite Client...');
        _client = new Client()
            .setEndpoint(appwriteUrl)
            .setProject(appwriteProjectId);

        // Log configuration only once during initialization
        console.log('AppWrite Configuration:', {
            endpoint: appwriteUrl,
            projectId: appwriteProjectId,
            databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
            bucketId: process.env.NEXT_PUBLIC_BUCKET_ID
        });
    }
    return _client;
};

// Getters for services
const getAccount = (): Account => {
    if (!_account) {
        _account = new Account(getClient());
    }
    return _account;
};

const getDatabases = (): Databases => {
    if (!_database) {
        _database = new Databases(getClient());
    }
    return _database;
};

const getStorage = (): Storage => {
    if (!_storage) {
        _storage = new Storage(getClient());
    }
    return _storage;
};

// Create a function to get a database instance with proper error handling
const getDatabase = async () => {
    try {
        // Use getters
        await getAccount().get();
        return getDatabases();
    } catch (error) {
        console.error('Authentication error in getDatabase:', error);
        // Instead of throwing an error, return the database instance
        // The database operations will fail with proper error messages if permissions are insufficient
        return getDatabases();
    }
};

// Function to check if user is authenticated
const isAuthenticated = async () => {
    try {
        // Use getter
        const user = await getAccount().get();
        console.log('User is authenticated:', user.$id);
        return true;
    } catch (error) {
        console.log('User is not authenticated:', error);
        return false;
    }
};

// Export services and utilities
// Export getters and utilities/static imports
export { getClient, getAccount, getDatabases, getStorage, getDatabase, isAuthenticated, Query, ID };

