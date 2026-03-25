import { PLANS } from './plans'

export function getUserPlanLimits(planName: string) {
  return PLANS[planName] || PLANS['مجاني']
}
