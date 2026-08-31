'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Eye, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface RiskItem {
  _id: string;
  title: string;
  fundraiserName: string;
  fundraiserId: string;
  goal: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskSignals: { name: string; score: number; reason: string }[];
  createdAt: string;
  status: string;
}

const levelColors: Record<string, string> = {
  low: 'bg-[#0ef695]/15 text-[#0ef695]',
  medium: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  high: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export default function AdminRiskPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<RiskItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/risk-queue?limit=50`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setItems(data.data || []);
      } catch {} finally { setIsDataLoading(false); }
    }
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!user) return null;

  const filtered = levelFilter === 'all' ? items : items.filter((i) => i.riskLevel === levelFilter);

  const handleAction = async (id: string, action: 'approve' | 'flag' | 'reject') => {
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/risk-queue/${id}/${action}`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
        toast.success(`Campaign ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged for review'}`);
      } else {
        toast.error(data.error?.message || 'Action failed');
      }
    } catch { toast.error('An error occurred'); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risk Assessment</h1>
          <p className="mt-1 text-muted-foreground">Campaigns flagged by the risk engine</p>
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isDataLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-foreground">No risk items</p>
          <p className="mt-2 text-muted-foreground">All campaigns look clean</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${levelColors[item.riskLevel]}`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.fundraiserName} &middot; Goal: ${item.goal.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={levelColors[item.riskLevel]}>{item.riskLevel} ({item.riskScore})</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAction(item._id, 'approve')}>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAction(item._id, 'reject')}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {expandedId === item._id && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <p className="text-sm font-medium text-foreground">Risk Signals:</p>
                    {item.riskSignals?.map((signal, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 shrink-0">+{signal.score}</Badge>
                        <p className="text-muted-foreground">{signal.reason}</p>
                      </div>
                    ))}
                    <a href={`/campaign/${item._id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                      View Campaign <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
