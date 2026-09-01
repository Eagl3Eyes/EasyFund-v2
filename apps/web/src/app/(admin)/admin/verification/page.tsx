'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

interface VerificationRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  level: string;
  status: string;
  documents?: string[];
  createdAt: string;
}

export default function AdminVerificationPage() {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function fetchRequests() {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/verification?limit=50`, { credentials: 'include' });
      const data = await res.json();
      setRequests(data.data?.requests || []);
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
    } finally {
      setIsDataLoading(false);
    }
  }

  async function updateStatus(requestId: string, status: string) {
    try {
      await fetch(`${getApiUrl()}/api/admin/verification/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      fetchRequests();
    } catch (error) {
      console.error('Failed to update verification:', error);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const processed = requests.filter((r) => r.status !== 'pending');

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-white/55">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verification Requests</h1>
        <p className="text-white/55">Review identity and organization verification</p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map((r) => (
              <Card key={r._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{r.userName}</p>
                        <Badge variant="outline">{r.level}</Badge>
                      </div>
                      <p className="text-sm text-white/55">{r.userEmail}</p>
                      <p className="text-xs text-white/55 mt-1">
                        Submitted {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatus(r._id, 'approved')}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(r._id, 'rejected')}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">History</h2>
        {isDataLoading ? (
          <Card className="animate-pulse"><CardContent className="h-32" /></Card>
        ) : processed.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-white/55 mb-4" />
              <p className="text-white/55">No verification history</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {processed.map((r) => (
              <Card key={r._id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{r.userName}</p>
                      <Badge variant="outline">{r.level}</Badge>
                    </div>
                    <p className="text-sm text-white/55">{r.userEmail}</p>
                  </div>
                  <Badge variant={r.status === 'approved' ? 'default' : 'destructive'}>
                    {r.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
