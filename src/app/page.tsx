import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero section */}
      <div className="mb-12 text-center">
        <h1 className="mb-6">Diastolic Function Assessment</h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Interactive tool for applying established diastolic function assessment algorithms
        </p>
        <Link 
          href="/algorithms" 
          className="btn-primary text-lg px-8 py-3"
        >
          View All Algorithms
        </Link>
      </div>

      {/* Features section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-dark-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Multiple Guidelines</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Access ASE/EACVI, BSE, and Mayo Clinic algorithms in one place, updated to the latest versions.
          </p>
        </div>
        
        <div className="bg-white dark:bg-dark-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Interpreted Flowcharts</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Published flowcharts have been interpreted into clear step-by-step logic with interactive decision points to guide your assessment.
          </p>
        </div>
        
        <div className="bg-white dark:bg-dark-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Research Citations</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Every algorithm includes full citations to reference materials and links to the source publications.
          </p>
        </div>
      </div>

      {/* Latest algorithms section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Latest Additions</h2>
        <div className="bg-white dark:bg-dark-700 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Mayo Clinic 2025</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Featuring evidence on the prognostic significance of Grade 1 diastolic dysfunction.
          </p>
          <Link 
            href="/algorithms/mayo2025?mode=standard" 
            className="btn-primary inline-block"
          >
            Try it now
          </Link>
        </div>
      </div>
      
      <div className="text-center">
        <Link 
          href="/algorithms" 
          className="btn-secondary"
        >
          Browse All Algorithms
        </Link>
      </div>
    </div>
  );
}