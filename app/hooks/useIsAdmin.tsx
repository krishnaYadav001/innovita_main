import { useMemo } from 'react';
import { useUser } from '@/app/context/user';

const useIsAdmin = (): boolean => {
    const contextUser = useUser();
    const userId = contextUser?.user?.id;

    const isAdmin = useMemo(() => {
        if (!userId) {
            return false; // Not logged in, not admin
        }

        const adminIdsEnv = process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '';
        // Add console log to check if the env var is being read
        console.log("useIsAdmin Hook - Read NEXT_PUBLIC_ADMIN_USER_IDS:", adminIdsEnv);
        const adminIdList = adminIdsEnv.split(',').map(id => id.trim()).filter(id => id); // Split, trim, remove empty

        if (adminIdList.length === 0) {
            console.warn("Admin check: NEXT_PUBLIC_ADMIN_USER_IDS environment variable is not set or empty.");
            return false; // No admins defined
        }

        return adminIdList.includes(userId);
    }, [userId]); // Recalculate only when userId changes

    return isAdmin;
};

export default useIsAdmin;