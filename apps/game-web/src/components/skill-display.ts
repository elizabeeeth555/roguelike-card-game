export function skillDisplay({ used, remaining, statusCode, allowed }: { used: boolean; remaining: number; statusCode?: string | null; allowed?: boolean }) {
 const state = used ? 'used' : remaining > 0 ? 'cooldown' : statusCode === 'mana' ? 'mana' : statusCode === 'poison' || statusCode === 'reference' || statusCode === 'missing' ? 'condition' : allowed === false ? 'locked' : 'ready';
 const label = state === 'used' ? '使用済' : state === 'cooldown' ? `CD中 ${remaining}T` : state === 'mana' ? 'MP不足' : state === 'condition' ? '条件未達' : '';
 return { state, label };
}
