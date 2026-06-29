// src/app/ConvexClerkProvider.tsx
"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        // Corrected property name from 'baseTheme' to 'theme'
        theme: dark,
        variables: {
          colorPrimary: '#ffd700',
          colorDanger: '#ff3366',
          colorSuccess: '#00ff88',
          colorWarning: '#ff00ff',
          colorBackground: '#0a0a0f',
          colorForeground: '#e8e8f0',
          colorMutedForeground: '#7a7a9a',
          borderRadius: '4px',
          fontFamily: '"VT323", monospace',
          fontSize: '16px',
        },
        elements: {
          formFieldInput: {
            backgroundColor: '#111118',
            borderColor: 'rgba(0, 255, 255, 0.4)',
          },
          card: {
            backgroundColor: '#1a1a2e',
          },
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}