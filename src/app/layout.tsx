import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Podcast Scene Generator - AI-Powered Script & Video Creation',
  description: 'Generate engaging podcast scripts with 5 distinct scenes and convert them into professional videos using advanced AI technology.',
  keywords: ['podcast', 'script generation', 'video generation', 'AI', 'content creation', 'storytelling'],
  authors: [{ name: 'Podcast Scene Generator' }],
  openGraph: {
    title: 'Podcast Scene Generator',
    description: 'Create engaging podcast scripts and videos with AI',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Podcast Scene Generator',
    description: 'Create engaging podcast scripts and videos with AI',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50 antialiased`}>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Podcast Scene Generator</h1>
                      <p className="text-sm text-gray-500 hidden sm:block">AI-Powered Script & Video Creation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>AI Script Generation</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Video Creation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>© 2024 Podcast Scene Generator</span>
                    <span>•</span>
                    <span>AI-Powered Content Creation</span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                      <span>Powered by Advanced AI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                      <span>Professional Quality</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                    <div>
                      <strong className="text-gray-700">How it works:</strong> Enter your podcast idea, get AI-generated script with 5 scenes, then convert each scene into professional videos.
                    </div>
                    <div>
                      <strong className="text-gray-700">AI Models:</strong> Uses advanced language models for script generation and cutting-edge video generation technology.
                    </div>
                    <div>
                      <strong className="text-gray-700">Output:</strong> High-quality scripts with realistic dialogue and cinematic video scenes ready for your podcast.
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}