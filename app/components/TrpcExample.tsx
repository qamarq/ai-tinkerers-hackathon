"use client";

import { trpc } from "@/lib/trpc/client";

export function TrpcExample() {
  const { data, isLoading } = trpc.hello.useQuery({ name: "World" });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-800">
      <h2 className="text-lg font-semibold mb-2">tRPC Example</h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Server says: <span className="font-mono text-blue-600">{data}</span>
      </p>
    </div>
  );
}
