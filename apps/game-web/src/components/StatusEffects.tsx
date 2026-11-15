import { UiImage } from './UiImage';
import { InfoPopover } from './InfoPopover';
import { statusEntries } from './status-effects';
import type { StatusEffectsProps } from './status-effects';
export type { StatusEffectsProps };
export function StatusEffects(props: StatusEffectsProps & { images?: boolean; placement?: 'above' | 'below' }) {
 return <ul className={`status-effects ${props.images ? 'compact-effects' : ''}`} aria-label="状態効果">{statusEntries(props).map(e => <li key={e.id} data-effect={e.id} className={e.id === 'poison' ? 'poison' : ''}><InfoPopover label={`${e.label} ${e.value}`} placement={props.placement} className="status-icon" icon={<><span aria-hidden="true">{props.images && e.image ? <UiImage number={e.image} /> : e.symbol}{e.id === 'setupBonus' && props.images && <small>次</small>}</span>{!props.images && <span>{e.label} </span>}<b>{e.value}</b></>}><p>{e.description}</p></InfoPopover></li>)}</ul>;
}
