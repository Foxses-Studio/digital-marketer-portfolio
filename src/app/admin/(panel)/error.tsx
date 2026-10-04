"use client";

import { CircleAlert } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";

/** Shown when an admin page throws. Never displays error details. */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Something went wrong"
      description="The page couldn't load. Try again, and if it keeps happening, check the server logs."
      action={
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
