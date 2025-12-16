import { useState, useRef, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Check, Search, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SearchableMultiSelectProps {
  options: string[];
  selectedValues: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

export function SearchableMultiSelect({
  options,
  selectedValues,
  onAdd,
  onRemove,
  placeholder = 'Search...',
  emptyText = 'No options found',
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const availableOptions = options.filter(
    opt => !selectedValues.includes(opt)
  );

  const filteredOptions = availableOptions.filter(opt =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onRemove(value);
    } else {
      onAdd(value);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="mr-2 h-4 w-4 text-muted-foreground" />
        {placeholder}
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <Input
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left",
                    selectedValues.includes(option) && "bg-accent"
                  )}
                  onClick={() => handleToggle(option)}
                >
                  <div className={cn(
                    "w-4 h-4 border rounded flex items-center justify-center",
                    selectedValues.includes(option) ? "bg-primary border-primary" : "border-input"
                  )}>
                    {selectedValues.includes(option) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
