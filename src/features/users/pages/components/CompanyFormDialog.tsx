import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Company } from '../types';

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (companyData: Partial<Company>) => void;
  initialData?: Company | null;
}

const defaultCompany = {
  name: '',
  pocName: '',
  pocEmail: '',
  pocMobile: '',
  location: '',
  userType: 'admin' as 'admin' | 'normal',
  validity: '',
};

export function CompanyFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CompanyFormDialogProps) {
  const [formData, setFormData] = useState(defaultCompany);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        pocName: initialData.pocName,
        pocEmail: initialData.pocEmail || '',
        pocMobile: initialData.pocMobile,
        location: initialData.location,
        userType: initialData.userType,
        validity: initialData.validity,
      });
    } else {
      setFormData(defaultCompany);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Modify Company Details' : 'Add New Company'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update company information and extend validity'
              : 'Register a new company with point of contact details'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <Label>POC Name</Label>
            <Input
              value={formData.pocName}
              onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          {/* Note: POC Email is not strictly required by API add_company but kept for UI completeness */}
          <div className="space-y-2">
            <Label>POC Email</Label>
            <Input
              type="email"
              value={formData.pocEmail}
              onChange={(e) => setFormData({ ...formData, pocEmail: e.target.value })}
              placeholder="john@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>POC Mobile</Label>
            <Input
              value={formData.pocMobile}
              onChange={(e) => setFormData({ ...formData, pocMobile: e.target.value })}
              placeholder="+1-555-0123"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="New York, USA"
            />
          </div>
          <div className="space-y-2">
            <Label>User Type</Label>
            <Select
              value={formData.userType}
              onValueChange={(value: 'admin' | 'normal') =>
                setFormData({ ...formData, userType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Validity Date</Label>
            <Input
              type="date"
              value={formData.validity}
              onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Add Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}