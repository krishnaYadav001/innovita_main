import { getDatabases } from "@/libs/AppWriteClient" // Use getter function

const useUpdateProfile = async (id: string, name: string, bio: string) => {
    try {
        await getDatabases().updateDocument( // Use getter
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
            id,
        {
            name: name,
            Bio: bio // Use capital 'B' for Bio field to match the AppWrite schema
        });
    } catch (error) {
        throw error
    }
}

export default useUpdateProfile