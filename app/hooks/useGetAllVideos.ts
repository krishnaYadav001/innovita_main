import { useState, useEffect } from 'react';

// Define a Video type
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  userId: string;
  userName: string;
  userImage: string;
  views: number;
  likes: number;
  createdAt: string;
}

// Mock video data
const mockVideos: Video[] = [
  {
    id: 'v1',
    title: 'How to create amazing TikTok videos',
    description: 'Learn the best techniques for creating viral TikTok content',
    thumbnailUrl: '/images/video-thumb-1.jpg',
    videoUrl: '/videos/sample1.mp4',
    userId: 'u1',
    userName: 'Krishna Yadav',
    userImage: '/images/user1.jpg',
    views: 15420,
    likes: 2340,
    createdAt: '2023-10-15T14:30:00Z'
  },
  {
    id: 'v2',
    title: 'Product review: Latest smartphone',
    description: 'Detailed review of the newest smartphone on the market',
    thumbnailUrl: '/images/video-thumb-2.jpg',
    videoUrl: '/videos/sample2.mp4',
    userId: 'u2',
    userName: 'gungun',
    userImage: '/images/user2.jpg',
    views: 8750,
    likes: 1200,
    createdAt: '2023-10-20T09:15:00Z'
  },
  {
    id: 'v3',
    title: 'Cooking tutorial: Easy pasta recipe',
    description: 'Learn how to make delicious pasta in under 15 minutes',
    thumbnailUrl: '/images/video-thumb-3.jpg',
    videoUrl: '/videos/sample3.mp4',
    userId: 'u3',
    userName: 'Arpita Mishra',
    userImage: '/images/user3.jpg',
    views: 6300,
    likes: 980,
    createdAt: '2023-10-25T16:45:00Z'
  },
  {
    id: 'v4',
    title: 'Travel vlog: Exploring Paris',
    description: 'Join me as I explore the beautiful city of Paris',
    thumbnailUrl: '/images/video-thumb-4.jpg',
    videoUrl: '/videos/sample4.mp4',
    userId: 'u1',
    userName: 'Krishna Yadav',
    userImage: '/images/user1.jpg',
    views: 12800,
    likes: 3100,
    createdAt: '2023-11-01T11:20:00Z'
  },
  {
    id: 'v5',
    title: 'Fitness routine for beginners',
    description: 'Simple workout routine for those new to fitness',
    thumbnailUrl: '/images/video-thumb-5.jpg',
    videoUrl: '/videos/sample5.mp4',
    userId: 'u2',
    userName: 'gungun',
    userImage: '/images/user2.jpg',
    views: 9500,
    likes: 1850,
    createdAt: '2023-11-05T08:10:00Z'
  }
];

export default function useGetAllVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set mock data
        setVideos(mockVideos);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch videos');
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { videos, isLoading, error };
}
