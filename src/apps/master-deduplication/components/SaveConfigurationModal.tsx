import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { X } from 'lucide-react';

interface SaveConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, tags: string[], autoApply: boolean) => void;
}

export function SaveConfigurationModal({
  isOpen,
  onClose,
  onSave,
}: SaveConfigurationModalProps) {
  const [name, setName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [autoApply, setAutoApply] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), tags, autoApply);
      // Reset form
      setName('');
      setTags([]);
      setTagInput('');
      setAutoApply(false);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setTags([]);
    setTagInput('');
    setAutoApply(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Save Configuration</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Save your current configuration for future use. Auto-apply will load this configuration automatically for similar files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Configuration Name */}
          <div className="space-y-2">
            <Label htmlFor="config-name" className="text-sm">Configuration Name *</Label>
            <Input
              id="config-name"
              placeholder="e.g., Customer Data Dedup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="config-tags" className="text-sm">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="config-tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag} className="flex-shrink-0">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-secondary-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Auto-apply */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="auto-apply"
              checked={autoApply}
              onCheckedChange={(checked) => setAutoApply(checked as boolean)}
            />
            <Label
              htmlFor="auto-apply"
              className="text-xs sm:text-sm font-normal cursor-pointer"
            >
              Auto-apply to similar files
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="w-full sm:w-auto">
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}