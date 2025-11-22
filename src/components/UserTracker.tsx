"use client";

import { useUserTracking } from "@/hooks/use-user-tracking";

export function UserTracker({ articleId }: { articleId?: string }) {
    useUserTracking({ articleId });
    return null;
}
