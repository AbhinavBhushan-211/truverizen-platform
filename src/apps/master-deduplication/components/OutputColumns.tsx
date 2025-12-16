import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { X } from 'lucide-react';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import { Checkbox } from '../../../components/ui/checkbox';

interface OutputColumn {
  column: string;
  enabled: boolean;
}

interface OutputColumnsProps {
  columns: string[];
  outputColumns: OutputColumn[];
  onAddColumn: (column: string) => void;
  onRemoveColumn: (column: string) => void;
}

export function OutputColumns({
  columns,
  outputColumns,
  onAddColumn,
  onRemoveColumn,
}: OutputColumnsProps) {
  const selectedColumns = outputColumns.filter(c => c.enabled);

  const selectAll = () => {
    columns.forEach(col => {
      if (!selectedColumns.find(c => c.column === col)) {
        onAddColumn(col);
      }
    });
  };

  const deselectAll = () => {
    selectedColumns.forEach(col => {
      onRemoveColumn(col.column);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Select output columns</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose which columns to include in the final output
        </p>

        {selectedColumns.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
            <p className="text-muted-foreground mb-4">
              Select which columns you want in the processed output.
            </p>
            <SearchableMultiSelect
              options={columns}
              selectedValues={selectedColumns.map(c => c.column)}
              onAdd={onAddColumn}
              onRemove={onRemoveColumn}
              placeholder="Search and select columns..."
              emptyText="No columns available"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Selected Columns as Tags */}
            <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg min-h-[80px]">
              {selectedColumns.map((col) => (
                <Badge
                  key={col.column}
                  variant="destructive"
                  className="px-3 py-1.5 text-sm flex items-center gap-2"
                >
                  {col.column}
                  <button
                    onClick={() => onRemoveColumn(col.column)}
                    className="hover:bg-destructive-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add More Button */}
            <SearchableMultiSelect
              options={columns}
              selectedValues={selectedColumns.map(c => c.column)}
              onAdd={onAddColumn}
              onRemove={onRemoveColumn}
              placeholder="Add more columns..."
              emptyText="All columns selected"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={selectedColumns.length === columns.length ? deselectAll : selectAll}
        >
          <Checkbox checked={selectedColumns.length === columns.length} />
          {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
    </div>
  );
}
