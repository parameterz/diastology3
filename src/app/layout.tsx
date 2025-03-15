import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import versionInfo from "@/config/version";

export const metadata = {
  title: "Diastology Algorithm Navigator",
  description:
    "A Collection of Diastolic Function Algorithms for Echocardiographers",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-dark-800 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="border-b border-gray-200 bg-white shadow-sm dark:border-dark-600 dark:bg-dark-700">
            <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/">
                <h1 className="text-2xl font-bold md:text-3xl hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Diastology Algorithm Navigator
                </h1>
              </Link>
              <div className="flex items-center">
                <ThemeSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="mt-auto border-t border-gray-200 py-6 text-center text-sm text-gray-600 dark:border-dark-600 dark:text-gray-400">
            <div className="container mx-auto px-4">
              <p>Diastology Algorithm Navigator</p>
              <p className="mt-2 text-xs">
                Version {versionInfo.version} (Build {versionInfo.buildNumber})
                • {versionInfo.buildDate}
              </p>
              <p className="mt-2" id="copyright">
                Dan Dyar, MA, ACS, RDCS, FASE © {new Date().getFullYear()}
              </p>
              <p className="mt-2">
                <a
                  href="https://www.linkedin.com/in/dan-dyar-ma-acs-rdcs-ae-pe-fe-fase-6387b448/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                  Connect on LinkedIn
                </a>
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
