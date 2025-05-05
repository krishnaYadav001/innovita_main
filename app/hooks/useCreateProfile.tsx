import { getDatabases, ID } from "@/libs/AppWriteClient" // Use getter function

const useCreateProfile = async (userId: string, name: string, image: string, bio: string) => {
    try {
        await getDatabases().createDocument( // Use getter
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
            ID.unique(),
        {
            user_id: userId,
            name: name,
            image: image,
            Bio: bio, // Use capital 'B' for Bio field to match the AppWrite schema
        });
    } catch (error) {
        throw error
    }
}

export default useCreateProfile