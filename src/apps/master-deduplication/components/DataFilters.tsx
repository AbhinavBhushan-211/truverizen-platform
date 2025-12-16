import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { X, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface Column {
  name: string;
  type: string;
}

interface Filter {
  column: string;
  value: string;
}

interface DataFiltersProps {
  columns: Column[];
  filters: Filter[];
  onUpdateFilter: (column: string, value: string) => void;
  onResetFilters: () => void;
}

export function DataFilters({ columns, filters, onUpdateFilter, onResetFilters }: DataFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(
    filters.filter(f => f.value).map(f => f.column)
  );
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  const addFilter = () => {
    if (selectedColumn && !activeFilters.includes(selectedColumn)) {
      setActiveFilters([...activeFilters, selectedColumn]);
      setSelectedColumn('');
    }
  };

  const removeFilter = (column: string) => {
    setActiveFilters(activeFilters.filter(c => c !== column));
    onUpdateFilter(column, '');
  };

  const availableColumns = columns.filter(
    col => !activeFilters.includes(col.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Filter data by column values before processing
        </p>
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Reset All Filters
        </Button>
      </div>

      {/* Add Filter Selector */}
      <div className="flex gap-2">
        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select column to filter..." />
          </SelectTrigger>
          <SelectContent>
            {availableColumns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addFilter} disabled={!selectedColumn}>
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          {activeFilters.map((columnName) => {
            const filterValue = filters.find(f => f.column === columnName)?.value || '';
            return (
              <div key={columnName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`filter-${columnName}`}>{columnName}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(columnName)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id={`filter-${columnName}`}
                  placeholder={`Filter ${columnName}...`}
                  value={filterValue}
                  onChange={(e) => onUpdateFilter(columnName, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      {activeFilters.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No filters applied. Add filters to refine your data.
        </div>
      )}
    </div>
  );
}
