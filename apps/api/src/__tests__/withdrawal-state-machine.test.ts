import { WithdrawalRepository } from '../repositories/withdrawal.repository';

describe('Withdrawal State Machine', () => {
  const transitions = WithdrawalRepository.VALID_TRANSITIONS;

  it('defines transitions for all statuses', () => {
    expect(transitions).toBeDefined();
    expect(transitions.requested).toBeDefined();
    expect(transitions.risk_check).toBeDefined();
    expect(transitions.under_review).toBeDefined();
    expect(transitions.approved).toBeDefined();
    expect(transitions.processing).toBeDefined();
    expect(transitions.completed).toBeDefined();
    expect(transitions.rejected).toBeDefined();
    expect(transitions.failed).toBeDefined();
    expect(transitions.cancelled).toBeDefined();
  });

  it('requested can transition to risk_check', () => {
    expect(transitions.requested).toContain('risk_check');
  });

  it('requested can transition to cancelled', () => {
    expect(transitions.requested).toContain('cancelled');
  });

  it('risk_check can transition to under_review or rejected', () => {
    expect(transitions.risk_check).toContain('under_review');
    expect(transitions.risk_check).toContain('rejected');
  });

  it('under_review can transition to approved or rejected', () => {
    expect(transitions.under_review).toContain('approved');
    expect(transitions.under_review).toContain('rejected');
  });

  it('approved can transition to processing or rejected', () => {
    expect(transitions.approved).toContain('processing');
    expect(transitions.approved).toContain('rejected');
  });

  it('processing can transition to completed or failed', () => {
    expect(transitions.processing).toContain('completed');
    expect(transitions.processing).toContain('failed');
  });

  it('completed has no outgoing transitions', () => {
    expect(transitions.completed).toEqual([]);
  });

  it('rejected has no outgoing transitions', () => {
    expect(transitions.rejected).toEqual([]);
  });

  it('failed can retry to requested', () => {
    expect(transitions.failed).toContain('requested');
  });

  it('cancelled can retry to requested', () => {
    expect(transitions.cancelled).toContain('requested');
  });

  it('does not allow invalid transitions', () => {
    expect(transitions.completed).not.toContain('requested');
    expect(transitions.rejected).not.toContain('approved');
    expect(transitions.processing).not.toContain('requested');
    expect(transitions.approved).not.toContain('completed');
  });
});

describe('WithdrawalRepository constructor', () => {
  it('can be instantiated', () => {
    const repo = new WithdrawalRepository();
    expect(repo).toBeDefined();
    expect(repo).toBeInstanceOf(WithdrawalRepository);
  });
});
