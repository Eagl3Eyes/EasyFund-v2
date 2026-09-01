'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Shield, CheckCircle, XCircle, Users as UsersIcon, Megaphone } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  emailVerified?: boolean;
  identityVerified?: boolean;
  totalDonated?: number;
  campaignsCount?: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const stats = useMemo(() => {
    const byRole: Record<string, number> = {};
    users.forEach((u) => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
    return { total: users.length, byRole };
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user || user?.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-white/55">Access Denied</p>
      </div>
    );
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/users?limit=100`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

  async function updateRole(userId: string, role: string) {
    try {
      await fetch(`${getApiUrl()}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-white/55">Manage platform users</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UsersIcon className="h-8 w-8 text-[#0ef695]" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-white/55">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.byRole['fundraiser'] || 0}</p>
                <p className="text-sm text-white/55">Fundraisers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.byRole['donor'] || 0}</p>
                <p className="text-sm text-white/55">Donors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.byRole['admin'] || 0}</p>
                <p className="text-sm text-white/55">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="donor">Donor</SelectItem>
            <SelectItem value="fundraiser">Fundraiser</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isDataLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-32" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="h-12 w-12 text-white/55 mb-4" />
            <p className="text-white/55">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Donated</TableHead>
                <TableHead>Campaigns</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-white/55">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : u.role === 'fundraiser' ? 'secondary' : 'outline'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.emailVerified ? (
                      <Badge variant="outline" className="text-[#0ef695] border-[#0ef695]/30">
                        <CheckCircle className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-white/55">
                        <XCircle className="mr-1 h-3 w-3" /> Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>${(u.totalDonated || 0).toLocaleString()}</TableCell>
                  <TableCell>{u.campaignsCount || 0}</TableCell>
                  <TableCell className="text-sm text-white/55">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => updateRole(u._id, 'admin')}
                        >
                          <Shield className="mr-1 h-3 w-3" /> Make Admin
                        </Button>
                      )}
                      {u.role === 'admin' && u._id !== user?._id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => updateRole(u._id, 'donor')}
                        >
                          Demote
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
