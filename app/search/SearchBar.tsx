import React, { useState, useRef, useEffect } from 'react'; // Added useEffect
import { BiSearch } from 'react-icons/bi'; // Removed BiFilterAlt
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added Link
import { useTheme } from '@/app/context/theme';
import { debounce } from 'debounce';
import { getDatabases } from '@/libs/AppWriteClient'; // Corrected import
import { Query, Models } from 'appwrite'; // Added Appwrite Query and Models
import { Post, Profile } from '@/app/types'; // Corrected types: Post, Profile instead of PostMainCompTypes, RandomUsers
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl'; // Added hook
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Added loading icon

// Define the filter types
type ContentType = 'all' | 'users' | 'products' | 'videos';
type SortBy = 'recent' | 'popular' | 'price_low' | 'price_high';
type PriceRange = 'all' | 'under50' | '50to100' | '100to200' | 'over200';

interface SearchBarProps {
  className?: string;
  simple?: boolean; // Add simple prop
}

export default function SearchBar({ className = '', simple = false }: SearchBarProps) { // Destructure simple prop
  const router = useRouter();
  const { theme } = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);

  // Search state
  const [inputValue, setInputValue] = useState(''); // State for immediate input value
  const [searchTerm, setSearchTerm] = useState(''); // State for debounced search term
  const [searchProfiles, setSearchProfiles] = useState<Profile[]>([]);
  const [searchVideos, setSearchVideos] = useState<Post[]>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Filter states removed
  // Filter handlers removed

  // Handle search input change with debounce
  // Function to fetch suggestions (now uses searchTerm state implicitly via useEffect)
  const fetchSuggestions = async (term: string) => {
      if (!term.trim()) {
          setSearchProfiles([]);
          setSearchVideos([]);
          setShowResultsDropdown(false);
          setIsLoadingSearch(false);
          return;
      }

      setIsLoadingSearch(true);
      setShowResultsDropdown(true);
      const db = getDatabases();

      try {
          // Fetch Users
          const profileResult = await db.listDocuments(
              process.env.NEXT_PUBLIC_DATABASE_ID!,
              process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE!,
              [Query.limit(5), Query.search("name", term)]
          );
          setSearchProfiles(profileResult.documents as unknown as Profile[]);

          // Fetch Videos
          const videoResult = await db.listDocuments(
              process.env.NEXT_PUBLIC_DATABASE_ID!,
              process.env.NEXT_PUBLIC_COLLECTION_ID_POST!,
              [Query.limit(5), Query.search("text", term), Query.orderDesc("$createdAt")]
          );
          setSearchVideos(videoResult.documents as unknown as Post[]);

      } catch (error) {
          console.error("Error fetching search suggestions:", error);
          setSearchProfiles([]);
          setSearchVideos([]);
      } finally {
          setIsLoadingSearch(false);
      }
  };

  // Debounced function to update the actual searchTerm used for fetching
  const debouncedSetSearchTerm = debounce((value: string) => {
      setSearchTerm(value);
  }, 300);

  // Handler for input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value); // Update input value immediately
      debouncedSetSearchTerm(value); // Update debounced search term
  };

  // useEffect to fetch suggestions when debounced searchTerm changes
  useEffect(() => {
      fetchSuggestions(searchTerm);
  }, [searchTerm]); // Dependency array includes only searchTerm

  // Handle search submission
  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();
    // Use inputValue for immediate search submission
    if (inputValue) {
      params.append('q', inputValue);
    }

    // Filter params removed, only search term 'q' is added if present

    // Navigate to search results page
    router.push(`/search?${params.toString()}`);
    setShowResultsDropdown(false); // Close dropdown on search submission
    setInputValue(''); // Clear immediate input value
    setSearchTerm(''); // Clear debounced search term

    // Filter closing logic removed

    // Log the search parameters for debugging
    console.log('Search params:', params.toString());
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
// Effect to handle clicks outside the search bar to close the dropdown
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResultsDropdown(false);
    }
  }
  // Bind the event listener
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    // Unbind the event listener on clean up
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [searchRef]);

const handleSuggestionClick = () => {
  setInputValue(''); // Clear input field
  setSearchTerm(''); // Clear debounced term
  setShowResultsDropdown(false);
}

return (
  <div ref={searchRef} className={`relative ${className}`}>
    <div className="flex items-center justify-end bg-[#F1F1F2] dark:bg-gray-700 p-1 rounded-full w-full">
      <input
        type="text"
        value={inputValue} // Bind value to inputValue
        onChange={handleInputChange} // Use new handler
        onKeyPress={handleKeyPress}
        onFocus={() => { if (inputValue) setShowResultsDropdown(true); }} // Show dropdown based on inputValue
        className="w-full pl-2 sm:pl-3 py-1.5 sm:py-2 bg-transparent text-black dark:text-white placeholder-[#838383] dark:placeholder-gray-400 text-[14px] sm:text-[15px] focus:outline-none"
        placeholder="Search users and videos..." // Updated placeholder
      />

      {/* Filter button removed */}

      {/* Search button */}
      {/* Conditionally render internal search button */}
      {!simple && (
        <div
          onClick={handleSearch}
          className="px-2 sm:px-3 py-1 flex items-center border-l border-l-gray-300 dark:border-l-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-full transition-colors"
        >
          <BiSearch className="text-gray-500 dark:text-white" size={20} />
        </div>
      )}
    </div>

    {/* Search Suggestions Dropdown */}
    {showResultsDropdown && (
      <div className="absolute top-12 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 max-h-96 overflow-y-auto">
        {isLoadingSearch ? (
          <div className="flex justify-center items-center p-4">
            <AiOutlineLoading3Quarters className="animate-spin text-[#F02C56]" size={24} />
          </div>
        ) : (
          <>
            {/* Show "No results" based on searchTerm (debounced value) */}
            {searchProfiles.length === 0 && searchVideos.length === 0 && searchTerm && !isLoadingSearch && (
               <p className="text-center text-gray-500 dark:text-gray-400 p-3 text-sm">No results found.</p>
            )}

            {/* User Results */}
            {searchProfiles.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 px-3 pt-2 pb-1">Users</p>
                <ul>
                  {searchProfiles.map((profile) => (
                    // Use profile.user_id for key and href
                    <li key={profile?.user_id}>
                      <Link
                        href={`/profile/${profile?.user_id}`}
                        onClick={handleSuggestionClick}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <img
                          className="rounded-full w-[30px] h-[30px]"
                          src={useCreateBucketUrl(profile?.image || '')}
                          alt={profile?.name}
                        />
                        <span className="text-sm font-medium text-black dark:text-white truncate">{profile?.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Results */}
            {searchVideos.length > 0 && (
               <div>
                 <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 px-3 pt-2 pb-1 border-t border-gray-200 dark:border-gray-700 mt-1">Videos</p>
                 <ul>
                   {searchVideos.map((post) => (
                     // Use post.id for key and href
                     <li key={post?.id}>
                       <Link
                         href={`/post/${post?.id}`}
                         onClick={handleSuggestionClick}
                         className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                       >
                         {/* Ideally show thumbnail, using text for now */}
                         {/* Use post.text */}
                         <span className="text-sm text-black dark:text-white line-clamp-1">{post?.text}</span>
                       </Link>
                     </li>
                   ))}
                 </ul>
               </div>
            )}
          </>
        )}
      </div>
    )}
    </div>
  );
}
