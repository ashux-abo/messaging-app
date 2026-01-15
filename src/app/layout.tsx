import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import ConvexClientProvider from './ConvexClientProvider';
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Koneksyon',
  description: 'Real-time messaging with Clerk and Convex',
  icons:{
    icon: [
      {
        rel: 'icon',
        type: 'image/svg',
        sizes: '32x32',
        url: '/koneksyon.svg',
      },
      {
        rel: 'icon',
        type: 'image/svg',
        sizes: '16x16',
        url: '/koneksyon.svg',
      }
    ],
    apple: [
      {
        rel: 'apple-touch-icon',
        url: '/koneksyon.svg',
      }
    ]
  }
}

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}