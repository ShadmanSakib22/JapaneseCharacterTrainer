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
          borderRadius: '0px',
          fontFamily: '"VT323", monospace',
          fontFamilyButtons: '"Press Start 2P", monospace',
          fontSize: '16px',
        },
        elements: {
          card: {
            border: '2px solid #ffd700',
            boxShadow: '0 0 24px rgba(255,215,0,0.2)',
            background: '#111118',
          },
          formButtonPrimary: {
            background: 'transparent',
            border: '2px solid #ffd700',
            color: '#ffd700',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
          },
          headerTitle: {
            color: '#ffd700',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
          },
          headerSubtitle: {
            color: '#7a7a9a',
          },
          socialButtonsBlockButton: {
            border: '1px solid rgba(255,215,0,0.3)',
            background: 'transparent',
            color: '#e8e8f0',
          },
          dividerLine: { background: 'rgba(255,215,0,0.2)' },
          dividerText: { color: '#7a7a9a' },
          formFieldInput: {
            background: '#1a1a2e',
            border: '1px solid rgba(255,215,0,0.3)',
            color: '#e8e8f0',
            borderRadius: '0px',
          },
          formFieldLabel: { color: '#7a7a9a' },
          identityPreviewText: { color: '#e8e8f0' },
          footerActionLink: { color: '#ffd700' },
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
