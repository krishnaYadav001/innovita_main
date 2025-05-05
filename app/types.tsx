export interface UserContextTypes {
    user: User | null;
    register: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<any>; // Changed to Promise<any> to handle boolean return
    logout: () => Promise<void>;
    checkUser: () => Promise<any>; // Changed to Promise<any> to handle boolean return
    isLoadingUser: boolean; // Added loading state indicator
}

export interface User {
    id: string,
    name: string,
    bio: string,
    image: string,
}

export interface Profile {
    id: string;
    user_id: string;
    name: string;
    image: string;
    bio: string;
}

export interface RandomUsers {
    id: string;
    name: string;
    image: string;
}

export interface Follow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface FollowWithProfile extends Follow {
    profile: {
        user_id: string;
        name: string;
        image: string;
    };
}

export interface CropperDimensions {
    height?: number | null;
    width?: number | null;
    left?: number | null;
    top?: number | null;
}

export interface Like {
    id: string;
    user_id: string;
    post_id: string;
  }

// Add this Product interface
export interface Product {
  id: string;
  name: string;
  price: number; // Or string depending on how you store prices
  image_url?: string; // Made optional, as we primarily use imageId
  product_url: string; // Link to the actual product page
  imageId: string; // Made required: ID of the image in Appwrite Storage
  user_id?: string; // ID of the user who created the product
}

export interface Post {
    $id: string; // Use Appwrite's default ID field
    id: string; // Keep for potential existing usage, or remove if unused
    user_id: string;
    video_url: string;
    text: string;
    created_at: string;
    tagged_products?: Product[]; // Added this line
    primary_product_id?: string | null; // Added for single linked product
}

export interface PostWithProfile {
    $id: string; // Use Appwrite's default ID field
    id: string; // Keep for potential existing usage, or remove if unused
    user_id: string;
    video_url: string;
    text: string;
    created_at: string;
    profile: {
        user_id: string;
        name: string;
        image: string;
    };
        tagged_products?: Product[]; // Keep for potential future use? Or remove if only primary matters now.
        primary_product_id?: string | null; // Added for single linked product
}

export interface CommentWithProfile {
    $id: string; // Use Appwrite's default ID field
    id: string; // Keep for potential existing usage, or remove if unused
    user_id: string;
    post_id: string;
    text: string;
    created_at: string;
    profile: {
        user_id: string;
        name: string;
        image: string;
    }
}

export interface Comment {
    id: string;
    user_id: string;
    post_id: string;
    text: string;
    created_at: string;
    is_rich_text?: boolean;
}

export interface ShowErrorObject {
    type: string;
    message: string;
}

export interface UploadError {
    type: string;
    message: string;
}

//////////////////////////////////////////////
//////////////////////////////////////////////

// COMPONENT TYPES
export interface CommentsHeaderCompTypes {
    params: { userId: string; postId: string; };
    post: PostWithProfile
}

export interface CommentsCompTypes {
    params: { userId: string; postId: string; };
}

export interface PostPageTypes {
    params: { userId: string; postId: string; };
}

export interface ProfilePageTypes {
    params: { id: string; };
}

export interface SingleCommentCompTypes {
    params: { userId: string; postId: string; };
    comment: CommentWithProfile
}

export interface PostUserCompTypes {
    post: Post
}

export interface PostMainCompTypes {
    post: PostWithProfile
}

export interface PostMainLikesCompTypes {
    post: PostWithProfile
}

export interface TextInputCompTypes {
    string: string;
    inputType: string;
    placeholder: string;
    onUpdate: (newValue: string) => void;
    error: string;
}


//////////////////////////////////////////////
//////////////////////////////////////////////

// LAYOUT INCLUDE TYPES
export interface MenuItemTypes {
    iconString: string,
    colorString?: string, // Make optional for backward compatibility
    colorClass?: string, // New property for CSS class-based styling
    sizeString: string
}

export interface MenuItemFollowCompTypes {
    user: RandomUsers
}