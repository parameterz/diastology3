// src/app/algorithms/[algorithm]/page.tsx
import { Metadata } from 'next'
import { readFile } from 'fs/promises'
import matter from 'gray-matter'
import path from 'path'
import { AlgorithmContent } from './components/AlgorithmContent'
import { AlgorithmNavigator } from './components/AlgorithmNavigator'
import { AlgorithmSummary } from './components/AlgorithmSummary'
import { AlgorithmCitation } from './components/AlgorithmCitation'

interface PageProps {
  params: Promise<{
    algorithm: string
  }>,
  searchParams: Promise<{
    mode?: string
  }>
}

interface CitationData {
  authors: string;
  title: string;
  journal: string;
  url: string;
}

interface FrontMatter {
  title: string;
  description: string;
  keywords: string[];
  citation: CitationData;
}

// This runs on the server at build/request time
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const algorithm = params.algorithm;
  
  const contentPath = path.join(process.cwd(), `src/app/algorithms/${algorithm}/content.md`)
  try {
    const content = await readFile(contentPath, 'utf8')
    // Use matter without type parameters and cast the result as needed
    const result = matter(content);
    const data = result.data as FrontMatter;
    
    return {
      title: data.title,
      description: data.description,
      keywords: data.keywords,
    }
  } catch (error) {
    console.error(`Error loading metadata for algorithm ${algorithm}:`, error)
    return {
      title: 'Algorithm Details',
      description: 'Diastolic function assessment algorithm',
    }
  }
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const algorithm = params.algorithm;
  const mode = searchParams?.mode;
  
  try {
    const contentPath = path.join(process.cwd(), `src/app/algorithms/${algorithm}/content.md`)
    const content = await readFile(contentPath, 'utf8')
    // Use matter without type parameters and cast the result as needed
    const result = matter(content);
    const data = result.data as FrontMatter;
    const markdownContent = result.content;

    return (
      <div className="space-y-6">
        {/* Algorithm Summary Card - Contains title, description, a brief intro */}
        <AlgorithmSummary
          title={data.title}
          description={data.description}
        />
        
        {/* On mobile: Navigator first, then content */}
        <div className="block lg:hidden">
          <div className="mb-6">
            <AlgorithmNavigator 
              algorithmId={algorithm} 
              modeId={mode}
            />
          </div>
          
          <div className="mb-6">
            <details className="bg-white dark:bg-dark-700 rounded-lg shadow">
              <summary className="p-4 font-medium cursor-pointer">
                View Algorithm Description
              </summary>
              <div className="p-4 pt-0 border-t dark:border-dark-600">
                <AlgorithmContent 
                  content={markdownContent}
                />
              </div>
            </details>
          </div>
        </div>
        
        {/* On desktop: Side-by-side layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <div className="sticky top-4 self-start">
              <AlgorithmNavigator 
                algorithmId={algorithm} 
                modeId={mode}
              />
            </div>
          </div>
          
          <div>
            <AlgorithmContent 
              content={markdownContent}
            />
          </div>
        </div>
        
        {/* Citation appears at the bottom */}
        <AlgorithmCitation 
          citation={data.citation}
        />
      </div>
    )
  } catch (error) {
    console.error(`Error loading algorithm ${algorithm}:`, error)
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <h2 className="text-xl font-bold">Error Loading Algorithm</h2>
        <p>There was a problem loading this algorithm. Please try again or select a different algorithm.</p>
      </div>
    )
  }
}
