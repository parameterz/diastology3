// src/app/algorithms/[algorithm]/components/AlgorithmCitation.tsx
"use client";

interface CitationData {
  authors: string;
  title: string;
  journal: string;
  url: string;
}

interface AlgorithmCitationProps {
  citation: CitationData;
}

export function AlgorithmCitation({ citation }: AlgorithmCitationProps) {
  return (
    <div className="p-5 bg-gray-50 dark:bg-dark-700 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Reference
      </h2>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <span className="font-medium">Authors:</span> {citation.authors}
        </p>
        <p>
          <span className="font-medium">Title:</span>{" "}
          <span className="italic">{citation.title}</span>
        </p>
        <p>
          <span className="font-medium">Publication:</span>{" "}
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            {citation.journal}
          </a>
        </p>
      </div>
    </div>
  );
}
