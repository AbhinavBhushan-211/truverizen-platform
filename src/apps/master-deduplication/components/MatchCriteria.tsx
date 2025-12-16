import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Slider } from '../../../components/ui/slider';
import { X, Plus } from 'lucide-react';
import { SearchableMultiSelect } from './SearchableMultiSelect';

interface MatchColumn {
  column: string;
  enabled: boolean;
}

interface MatchCriteriaProps {
  columns: string[];
  matchColumns: MatchColumn[];
  similarityThreshold: number;
  onAddColumn: (column: string) => void;
  onRemoveColumn: (column: string) => void;
  onSetSimilarityThreshold: (value: number) => void;
}

export function MatchCriteria({
  columns,
  matchColumns,
  similarityThreshold,
  onAddColumn,
  onRemoveColumn,
  onSetSimilarityThreshold,
}: MatchCriteriaProps) {
  const selectedColumns = matchColumns.filter(c => c.enabled);

  return (
    <div className="space-y-6">
      {/* Select fields for comparison */}
      <div>
        <Label className="mb-3 block">Select fields for comparison</Label>
        
        {selectedColumns.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
            <p className="text-muted-foreground mb-4">
              No match criteria selected. Use the button below to add criteria.
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

      {/* Similarity Threshold */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <Label htmlFor="similarity" className="mb-3 block">Similarity Threshold</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="similarity"
              min={0}
              max={100}
              step={5}
              value={[similarityThreshold * 100]}
              onValueChange={(v) => onSetSimilarityThreshold(v[0] / 100)}
              className="flex-1"
            />
            <Badge variant="secondary" className="min-w-[60px] justify-center text-destructive">
              {(similarityThreshold * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Higher values require closer matches to be considered duplicates
        </p>
      </div>
    </div>
  );
}
