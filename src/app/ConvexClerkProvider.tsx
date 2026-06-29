// src/app/ConvexClerkProvider.tsx
"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: '#0a0a0f',
          colorInputBackground: '#1a1a2e',
          colorPrimary: '#ffd700',
          colorText: '#e8e8f0',
          colorTextSecondary: '#7a7a9a',
          colorDanger: '#ff3366',
          borderRadius: '4px',
          fontFamily: '"VT323", monospace',
          fontSize: '16px',
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
