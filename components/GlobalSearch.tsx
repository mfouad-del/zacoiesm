/**
 * Global Search Component
 * Search across all modules with filters
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { globalSearchService, SearchResult, SearchableEntity } from '@/lib/search/global.service';
// import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/performance/optimization';

export const GlobalSearch: React.FC = () => {
  // const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<SearchableEntity[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await globalSearchService.search(
          searchQuery,
          selectedTypes.length > 0 ? { entityTypes: selectedTypes } : undefined
        );
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [selectedTypes]
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    // router.push(result.url);
    window.location.href = result.url;
    setQuery('');
    setResults([]);
  };

  const toggleType = (type: SearchableEntity) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getEntityIcon = (type: SearchableEntity): string => {
    const icons: Record<SearchableEntity, string> = {
      projects: '📁',
      tasks: '✓',
      documents: '📄',
      ncrs: '⚠️',
      expenses: '💰',
      users: '👤',
      contracts: '📝'
    };
    return icons[type];
  };

  const allTypes: SearchableEntity[] = [
    'projects',
    'tasks',
    'documents',
    'ncrs',
    'expenses',
    'contracts'
  ];

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search projects, tasks, documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mt-2 p-3">
          <div className="text-sm font-medium mb-2">Filter by type:</div>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleType(type)}
              >
                {getEntityIcon(type)} {type}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {query.length >= 2 && (
        <Card className="mt-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No results found</div>
          ) : (
            <div className="divide-y">
              {results.map((result) => (
                <button
                  key={`${result.entityType}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-3 hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getEntityIcon(result.entityType)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {result.title}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {result.entityType}
                        </Badge>
                      </div>
                      {result.description && (
                        <div className="text-sm text-gray-600 truncate">
                          {result.description}
                        </div>
                      )}
                      {result.metadata && (
                        <div className="flex gap-2 mt-1">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-500">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round(result.relevance)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Keyboard Shortcuts Hint */}
      {query.length === 0 && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+K</kbd> for quick search
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
