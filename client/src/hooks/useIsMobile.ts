import { useMemo } from 'react';

export function useIsMobile(): boolean {
    const isMobile = useMemo(() => {
        if (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            )
        ) {
            return true;
        }
        return false;
    }, []);

    return isMobile;
}
