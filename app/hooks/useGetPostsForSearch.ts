import { useState, useEffect } from 'react';
import { getDatabases, Query } from "@/libs/AppWriteClient"; // Use getter function
import useGetProfileByUserId from "./useGetProfileByUserId";
import useCreateBucketUrl from "./useCreateBucketUrl";
import { PostWithProfile } from '@/app/types';

export default function useGetPostsForSearch() {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        const response = await getDatabases().listDocuments(
          String(process.env.NEXT_PUBLIC_DATABASE_ID),
          String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
          [Query.orderDesc("$id")]
        );

        const documents = response.documents;

        const postsWithProfiles = await Promise.all(
          documents.map(async (doc) => {
            const profile = await useGetProfileByUserId(doc?.user_id);

            return {
              id: doc?.$id,
              user_id: doc?.user_id,
              video_url: doc?.video_url,
              text: doc?.text,
              created_at: doc?.created_at,
              primary_product_id: doc?.primary_product_id,
              profile: {
                user_id: profile?.user_id,
                name: profile?.name,
                image: profile?.image,
              }
            };
          })
        );

        setPosts(postsWithProfiles);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching posts for search:", err);
        setError(err.message || "Failed to fetch posts");
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, isLoading, error };
}
