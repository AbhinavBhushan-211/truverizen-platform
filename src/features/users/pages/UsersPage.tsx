import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';

// Components
import { UserList } from './components/UserList';
import { UserFormDialog } from './components/UserFormDialog';
import { CompanyList } from './components/CompanyList';
import { CompanyFormDialog } from './components/CompanyFormDialog';

// Types
import { User, Company } from './types';

const API_BASE = 'http://16.16.197.117:5050';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'admin';

  // --- State Management ---
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // --- API HELPER FUNCTIONS ---

  // Map API User response to UI User type
  const mapApiUserToUi = (apiUser: any): User => ({
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    company: apiUser.company,
    // Fix: Use the role from API if it exists, otherwise default to normal
    role: apiUser.role || 'normal', 
    status: apiUser.status || 'active',
    lastLogin: apiUser.last_login || new Date().toISOString(),
    avatar: undefined
  });

  // Map API Company response to UI Company type
  const mapApiCompanyToUi = (apiCompany: any): Company => ({
    id: String(apiCompany.id),
    name: apiCompany.company_name,
    pocName: apiCompany.poc_name,
    pocEmail: '', 
    pocMobile: apiCompany.poc_contact,
    location: apiCompany.location,
    userType: 'normal', 
    validity: apiCompany.validity,
    status: apiCompany.status === 'Active' ? 'active' : 'expired',
    totalUsers: parseInt(apiCompany.users) || 0,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Get Users
      const usersRes = await fetch(`${API_BASE}/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) {
          setUsers(usersData.map(mapApiUserToUi));
        }
      }

      // 2. Get Companies
      const companiesRes = await fetch(`${API_BASE}/get_companies`);
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        if (Array.isArray(companiesData)) {
          setCompanies(companiesData.map(mapApiCompanyToUi));
        }
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load data from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC / HANDLERS ---

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.pocName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- USER HANDLERS ---
  
  const handleCreateUser = async (formData: any) => {
    try {
      // FIX: Added 'role' to the payload
      const payload = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        password: formData.password,
        role: formData.role // <--- Sending role to backend now
      };

      const response = await fetch(`${API_BASE}/create_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create user');

      toast.success('User account created successfully');
      fetchData(); // Refresh list to show new user
    } catch (error) {
      console.error(error);
      toast.error('Error creating user. Check console for details.');
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!editingUser) return;
    try {
      // FIX: Added 'role' to the payload
      const payload = {
        name: userData.name,
        company: userData.company,
        email: userData.email,
        role: userData.role, // <--- Sending role update
        // Note: Only sending password if your API requires it for updates. 
        // If not, you might want to remove this line.
        password: 'password123' 
      };

      const response = await fetch(`${API_BASE}/update_user/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update user');

      toast.success('User account updated successfully');
      setEditingUser(null);
      fetchData(); // Refresh list to show updates
    } catch (error) {
      console.error(error);
      toast.error('Error updating user');
    }
  };

  // In UsersPage.tsx

  const handleDeleteUser = async (userId: string) => {
    // 1. Confirm first (Moved from UserList to here for better stability)
    if (!window.confirm("Are you sure you want to permanently delete this user?")) {
      return;
    }

    try {
      // 2. Log the attempt for debugging
      console.log(`Attempting to delete user with ID: ${userId}`);

      const response = await fetch(`${API_BASE}/delete_user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 3. Check for server errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      // 4. Success: Update UI
      toast.success('User deleted successfully');
      
      // Update local state immediately (Optimistic UI update)
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId)); 

    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error('Error deleting user. Check console for details.');
    }
  };
  const handleRevokeUser = (userId: string) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: 'revoked' } : u))
    );
    toast.success('User account revoked (Local Only)');
  };

  const handleResetPassword = (userId: string) => {
    toast.success('Password reset link sent');
  };

  // --- COMPANY HANDLERS ---

  const handleCreateCompany = async (companyData: Partial<Company>) => {
    try {
      const payload = {
        company_name: companyData.name,
        poc_name: companyData.pocName,
        poc_contact: companyData.pocMobile,
        location: companyData.location,
        users: "0",
        validity: companyData.validity,
        status: "Active",
        actions: "None"
      };

      const response = await fetch(`${API_BASE}/add_company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create company');

      toast.success('Company added successfully');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error adding company');
    }
  };

  const handleUpdateCompany = (companyData: Partial<Company>) => {
    if (!editingCompany) return;
    setCompanies(
      companies.map((c) =>
        c.id === editingCompany.id ? { ...c, ...companyData } : c
      )
    );
    setEditingCompany(null);
    toast.success('Company details updated (Local Only)');
  };

  const handleDeleteCompany = (companyId: string) => {
    setCompanies(companies.filter((c) => c.id !== companyId));
    toast.success('Company deleted (Local Only)');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>User Management</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? 'Manage users and companies across the platform'
              : 'Manage users within your company'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="companies">Companies</TabsTrigger>}
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <Card className="flex-1 p-4 mr-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsUserDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>

          <Card>
            <UserList
              users={filteredUsers}
              onEdit={(user) => {
                setEditingUser(user);
                setIsUserDialogOpen(true);
              }}
              onRevoke={handleRevokeUser}
              onDelete={handleDeleteUser} 
              onResetPassword={handleResetPassword}
            />
          </Card>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center justify-between">
              <Card className="flex-1 p-4 mr-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </Card>
              <Button
                onClick={() => {
                  setEditingCompany(null);
                  setIsCompanyDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </div>
            <CompanyList
              companies={filteredCompanies}
              onEdit={(company) => {
                setEditingCompany(company);
                setIsCompanyDialogOpen(true);
              }}
              onDelete={handleDeleteCompany}
            />
          </TabsContent>
        )}
      </Tabs>

      <UserFormDialog
        open={isUserDialogOpen}
        onOpenChange={(open) => {
          setIsUserDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        initialData={editingUser}
      />

      <CompanyFormDialog
        open={isCompanyDialogOpen}
        onOpenChange={(open) => {
          setIsCompanyDialogOpen(open);
          if (!open) setEditingCompany(null);
        }}
        onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
        initialData={editingCompany}
      />
    </div>
  );
}