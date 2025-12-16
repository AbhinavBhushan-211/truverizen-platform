import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';

interface ConflictRule {
  id: string;
  leftTerm: string;
  rightTerm: string;
}

interface ConflictRulesProps {
  conflictRules: ConflictRule[];
  onAddRule: (leftTerm: string, rightTerm: string) => void;
  onRemoveRule: (id: string) => void;
  onUpdateRule: (id: string, leftTerm: string, rightTerm: string) => void;
}

export function ConflictRules({
  conflictRules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
}: ConflictRulesProps) {
  const [newLeftTerm, setNewLeftTerm] = useState('');
  const [newRightTerm, setNewRightTerm] = useState('');

  const handleAdd = () => {
    if (newLeftTerm.trim() && newRightTerm.trim()) {
      onAddRule(newLeftTerm.trim(), newRightTerm.trim());
      setNewLeftTerm('');
      setNewRightTerm('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Conflict Resolution Rules</Label>
        <p className="text-sm text-muted-foreground">
          Define keyword pairs that must not appear together in a matched record. 
          If both values occur, the system will flag a conflict.
        </p>
      </div>

      {conflictRules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            No conflict rules defined yet.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Left Term</TableHead>
                <TableHead className="w-[40%]">Right Term</TableHead>
                <TableHead className="w-[20%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflictRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Input
                      value={rule.leftTerm}
                      onChange={(e) => onUpdateRule(rule.id, e.target.value, rule.rightTerm)}
                      placeholder="Left term"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={rule.rightTerm}
                      onChange={(e) => onUpdateRule(rule.id, rule.leftTerm, e.target.value)}
                      placeholder="Right term"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add New Rule */}
      <div className="space-y-3 pt-4 border-t">
        <Label>Add Conflict Rule</Label>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input
            placeholder="Left term (e.g., 'lh', 'left')"
            value={newLeftTerm}
            onChange={(e) => setNewLeftTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Input
            placeholder="Right term (e.g., 'rh', 'right')"
            value={newRightTerm}
            onChange={(e) => setNewRightTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={!newLeftTerm.trim() || !newRightTerm.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Example: Adding "lh" and "rh" will flag records that contain both terms
        </p>
      </div>
    </div>
  );
}
