"use client";

import { useState, useEffect } from 'react';
import { getDatabases } from '@/libs/AppWriteClient'; // Use getter function

interface User {
  id: string;
  user_id: string;
  name: string;
  image: string;
  bio: string;
  createdAt: string;
}

const useGetAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        bio: doc.Bio || doc.bio || '', // Handle both Bio and bio fields
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetchUsers: fetchUsers
  };
};

export default useGetAllUsers;
