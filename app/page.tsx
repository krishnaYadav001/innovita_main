"use client"

import { useEffect, useState } from "react"
import MainLayout from "./layouts/MainLayout"
import { usePostStore } from "@/app/stores/post"
import ClientOnly from "./components/ClientOnly"
import PostMain from "./components/PostMain"
import EmptyState from "./components/EmptyState"
import { BiLoaderCircle } from "react-icons/bi"

export default function Home() {
  let { allPosts, setAllPosts } = usePostStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        await setAllPosts();
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <>
      <MainLayout>
        <div className="mt-[70px] w-full max-w-[1000px] mx-auto bg-white dark:bg-black">
          <ClientOnly>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <BiLoaderCircle className="animate-spin" size={40} color="#F02C56" />
              </div>
            ) : allPosts.length > 0 ? (
              allPosts.map((post, index) => (
                <PostMain post={post} key={index} />
              ))
            ) : (
              <div className="py-10 px-4">
                <EmptyState
                  type="posts"
                  message="Welcome to Innovita! There are no posts yet. Be the first to create content and share your ideas."
                  actionLink="/upload"
                  actionText="Create Your First Post"
                />
              </div>
            )}
          </ClientOnly>
        </div>
      </MainLayout>
    </>
  )
}

