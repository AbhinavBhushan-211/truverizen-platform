import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Users, UserCheck, UserPlus, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../../components/ui/badge';

type TimeFilter = 'today' | 'week' | 'month' | 'custom';

// Mock data for usage trend (last 7 days)
const usageTrendData = [
  { date: '10 Nov', users: 42, documents: 120 },
  { date: '11 Nov', users: 48, documents: 145 },
  { date: '12 Nov', users: 45, documents: 132 },
  { date: '13 Nov', users: 52, documents: 168 },
  { date: '14 Nov', users: 58, documents: 189 },
  { date: '15 Nov', users: 54, documents: 175 },
  { date: '16 Nov', users: 61, documents: 201 },
];

// Mock drill-down data for users
const userDrillDownData = [
  { name: 'John Doe', email: 'john@company.com', lastActive: '2 hours ago', documentsProcessed: 24, status: 'active' },
  { name: 'Jane Smith', email: 'jane@company.com', lastActive: '5 hours ago', documentsProcessed: 18, status: 'active' },
  { name: 'Mike Johnson', email: 'mike@company.com', lastActive: '1 day ago', documentsProcessed: 32, status: 'active' },
  { name: 'Sarah Williams', email: 'sarah@company.com', lastActive: '3 hours ago', documentsProcessed: 15, status: 'active' },
  { name: 'Tom Brown', email: 'tom@company.com', lastActive: '30 mins ago', documentsProcessed: 41, status: 'active' },
];

// Mock company data for admin
const companyData = [
  { name: 'Acme Corp', users: 15, documentsProcessed: 1245, status: 'active', plan: 'Enterprise' },
  { name: 'TechStart Inc', users: 8, documentsProcessed: 567, status: 'active', plan: 'Professional' },
  { name: 'LegalFirm LLP', users: 22, documentsProcessed: 2341, status: 'active', plan: 'Enterprise' },
  { name: 'Consulting Group', users: 5, documentsProcessed: 234, status: 'trial', plan: 'Professional' },
];

// Mock billing data
const billingData = [
  { service: 'AWS Bedrock (Claude)', usage: '2.4M tokens', cost: '$124.50', date: '15 Nov 2025' },
  { service: 'Mistral OCR', usage: '834 pages', cost: '$42.30', date: '15 Nov 2025' },
  { service: 'Storage & Infrastructure', usage: '127 GB', cost: '$18.75', date: '15 Nov 2025' },
  { service: 'AWS Bedrock (Claude)', usage: '2.1M tokens', cost: '$108.20', date: '14 Nov 2025' },
  { service: 'Mistral OCR', usage: '756 pages', cost: '$38.40', date: '14 Nov 2025' },
];

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [drillDownDialog, setDrillDownDialog] = useState<'users' | 'activeUsers' | 'companies' | null>(null);

  const isAdmin = hasRole(['admin']);

  const handleStatClick = (type: 'users' | 'activeUsers' | 'companies') => {
    setDrillDownDialog(type);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of platform activity and usage
          </p>
        </div>

        {/* Time Filter */}
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Last 7 Days</TabsTrigger>
            <TabsTrigger value="month">Last 30 Days</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick('users')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">156</div>
            <p className="text-xs text-muted-foreground">
              Click to view details
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick('activeUsers')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">61</div>
            <p className="text-xs text-muted-foreground">
              Currently active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">New Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">12</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatClick('companies')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{companyData.length}</div>
              <p className="text-xs text-muted-foreground">
                Active organizations
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Usage Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={usageTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Active Users"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="documents"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Documents Processed"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Billing History - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Billing History</CardTitle>
              </div>
              <Badge variant="secondary">Administrator Only</Badge>
            </div>
            <p className="text-muted-foreground">
              Cloud service usage and costs
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.service}</TableCell>
                    <TableCell>{item.usage}</TableCell>
                    <TableCell className="font-medium">{item.cost}</TableCell>
                    <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-muted rounded-lg flex justify-between items-center">
              <span className="font-medium">Total (Last 30 Days)</span>
              <span className="text-2xl">$823.45</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drill-down Dialogs */}
      <Dialog open={drillDownDialog === 'users'} onOpenChange={() => setDrillDownDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Total Users</DialogTitle>
            <DialogDescription>Complete list of all registered users</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDrillDownData.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                  <TableCell>{user.documentsProcessed}</TableCell>
                  <TableCell>
                    <Badge variant="default">{user.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={drillDownDialog === 'activeUsers'} onOpenChange={() => setDrillDownDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Active Users</DialogTitle>
            <DialogDescription>Users active in the last 24 hours</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Documents Today</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDrillDownData.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                  <TableCell>{user.documentsProcessed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={drillDownDialog === 'companies'} onOpenChange={() => setDrillDownDialog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Companies</DialogTitle>
            <DialogDescription>All registered organizations</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyData.map((company, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.users}</TableCell>
                  <TableCell>{company.documentsProcessed}</TableCell>
                  <TableCell>{company.plan}</TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
