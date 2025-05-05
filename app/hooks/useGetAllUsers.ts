import { useState, useEffect } from 'react';
import { getDatabases, Query } from "@/libs/AppWriteClient"; // Use getter function
import useCreateBucketUrl from "./useCreateBucketUrl";

export interface User {
  id: string;
  user_id: string;
  name: string;
  image: string;
  bio: string;
  createdAt?: string; // This might not be available in the profile collection
}

export default function useGetAllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);

        // Fetch all profiles from the database
        const response = await getDatabases().listDocuments(
          String(process.env.NEXT_PUBLIC_DATABASE_ID),
          String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE)
        );

        const documents = response.documents;

        // Map the documents to our User interface
        const fetchedUsers = documents.map(doc => ({
          id: doc.$id,
          user_id: doc.user_id,
          name: doc.name,
          image: doc.image,
          bio: doc.Bio || '', // Use uppercase B as per Appwrite collection
          createdAt: doc.$createdAt // Using Appwrite's document creation date
        }));

        setUsers(fetchedUsers);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to fetch users");
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading, error };
}
