export type Plan = 'FREE' | 'TRIAL' | 'PRO' | 'BUSINESS';

export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 1,
  TRIAL: 3,
  PRO: 10,
  BUSINESS: 50,
};

export function getPlanLimit(plan: string | null | undefined): number {
  return PLAN_LIMITS[(plan as Plan) ?? 'FREE'] ?? 1;
}