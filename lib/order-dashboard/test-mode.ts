/**
 * Order-dashboard testmodus: lezen mag, schrijven naar externe systemen niet.
 *
 * Default: UIT (live).
 * Aan zetten: ORDER_DASHBOARD_TEST_MODE=true (+ NEXT_PUBLIC_… voor de banner).
 */
function parseFlag(value: string | undefined): boolean | null {
  if (value == null || value === '') return null
  const v = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(v)) return true
  if (['0', 'false', 'no', 'off'].includes(v)) return false
  return null
}

export function isOrderDashboardTestMode(): boolean {
  const parsed =
    parseFlag(process.env.ORDER_DASHBOARD_TEST_MODE) ??
    parseFlag(process.env.NEXT_PUBLIC_ORDER_DASHBOARD_TEST_MODE)
  // Default UIT
  return parsed === true
}

export const TEST_MODE_BLOCK_MESSAGE =
  'Testmodus staat aan: er worden geen wijzigingen doorgeschreven naar WooCommerce of Pakketpartner. Alleen lezen/printen is toegestaan.'

/** Gooit als testmodus aan staat — gebruik vóór elke write naar WC/externe systemen. */
export function assertOrderDashboardWritesAllowed(): void {
  if (isOrderDashboardTestMode()) {
    throw new Error(TEST_MODE_BLOCK_MESSAGE)
  }
}
