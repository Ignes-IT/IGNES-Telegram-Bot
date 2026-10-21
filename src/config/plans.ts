export type Plan = 'FREE' | 'TRIAL' | 'PRO' | 'BUSINESS';

export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 1,
  TRIAL: 2,
  PRO: 5,
  BUSINESS: 10,
};

export function getPlanLimit(plan: string | null | undefined): number {
  return PLAN_LIMITS[(plan as Plan) ?? 'FREE'] ?? 1;
}