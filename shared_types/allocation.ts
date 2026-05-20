// ─── Allocation Types ─────────────────────────────────────────

export type AllocationStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'released' | 'expired';

export interface IAllocation {
  allocation_id: string;
  resource_id: string;
  resource_name?: string;
  requested_by: string;
  requester_name?: string;
  approved_by: string | null;
  start_time: string;
  end_time: string;
  status: AllocationStatus;
  created_at: string;
}

export interface IAllocationRequest {
  resource_id: string;
  start_time: string;
  end_time: string;
}

export interface IAllocationAction {
  status: 'approved' | 'rejected' | 'released';
}
