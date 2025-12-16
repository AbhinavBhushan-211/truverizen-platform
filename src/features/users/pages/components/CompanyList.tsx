import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Building2, Edit, Trash2 } from 'lucide-react';
import { Company } from '../types';

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void; 
}

export function CompanyList({ companies, onEdit, onDelete }: CompanyListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Registered Companies</CardTitle>
        </div>
        <CardDescription>
          Manage company registrations and point of contacts
        </CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>POC Name</TableHead>
            <TableHead>POC Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>{company.pocName}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{company.pocEmail || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">
                    {company.pocMobile}
                  </div>
                </div>
              </TableCell>
              <TableCell>{company.location}</TableCell>
              <TableCell>{company.totalUsers}</TableCell>
              <TableCell className="text-muted-foreground">
                {company.validity}
              </TableCell>
              <TableCell>
                <Badge
                  variant={company.status === 'active' ? 'default' : 'destructive'}
                >
                  {company.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(company)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modify
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                        if(confirm('Are you sure you want to delete this company?')) {
                          onDelete(company.id);
                        }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}