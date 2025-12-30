/**
 * Non-Conformance Report (NCR) State Machine
 * Manages the lifecycle of an NCR.
 */

export enum NCRStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  PROPOSED_ACTION = 'PROPOSED_ACTION',
  ACTION_APPROVED = 'ACTION_APPROVED',
  ACTION_REJECTED = 'ACTION_REJECTED',
  ACTION_COMPLETED = 'ACTION_COMPLETED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED'
}

export enum NCRAction {
  ISSUE = 'ISSUE',
  ACKNOWLEDGE = 'ACKNOWLEDGE',
  PROPOSE = 'PROPOSE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMPLETE = 'COMPLETE',
  VERIFY = 'VERIFY',
  CLOSE = 'CLOSE'
}

export class NCRStateMachine {
  private static transitions: Record<NCRStatus, Partial<Record<NCRAction, NCRStatus>>> = {
    [NCRStatus.DRAFT]: {
      [NCRAction.ISSUE]: NCRStatus.ISSUED
    },
    [NCRStatus.ISSUED]: {
      [NCRAction.ACKNOWLEDGE]: NCRStatus.ACKNOWLEDGED
    },
    [NCRStatus.ACKNOWLEDGED]: {
      [NCRAction.PROPOSE]: NCRStatus.PROPOSED_ACTION
    },
    [NCRStatus.PROPOSED_ACTION]: {
      [NCRAction.APPROVE]: NCRStatus.ACTION_APPROVED,
      [NCRAction.REJECT]: NCRStatus.ACTION_REJECTED
    },
    [NCRStatus.ACTION_REJECTED]: {
      [NCRAction.PROPOSE]: NCRStatus.PROPOSED_ACTION
    },
    [NCRStatus.ACTION_APPROVED]: {
      [NCRAction.COMPLETE]: NCRStatus.ACTION_COMPLETED
    },
    [NCRStatus.ACTION_COMPLETED]: {
      [NCRAction.VERIFY]: NCRStatus.VERIFIED,
      [NCRAction.REJECT]: NCRStatus.ACTION_APPROVED // Re-do action
    },
    [NCRStatus.VERIFIED]: {
      [NCRAction.CLOSE]: NCRStatus.CLOSED
    },
    [NCRStatus.CLOSED]: {}
  };

  static transition(currentStatus: NCRStatus, action: NCRAction): NCRStatus {
    const allowedTransitions = this.transitions[currentStatus];
    if (!allowedTransitions || !allowedTransitions[action]) {
      throw new Error(`Invalid transition from ${currentStatus} with action ${action}`);
    }
    return allowedTransitions[action]!;
  }

  static getNextPossibleStates(currentStatus: NCRStatus): NCRStatus[] {
    const allowedTransitions = this.transitions[currentStatus];
    if (!allowedTransitions) return [];
    return Object.values(allowedTransitions);
  }
}
