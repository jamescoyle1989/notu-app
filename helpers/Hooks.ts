import { useState } from "react";

export function useManualRefresh(): () => void {
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const triggerFunc = () => {
        setRefreshTrigger(!refreshTrigger);
    };

    return triggerFunc;
}