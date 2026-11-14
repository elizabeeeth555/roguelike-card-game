import { UI_IMAGES, uiImageUrl } from '../ui-image-assets';
// Crop the transparent canvas in the viewport, preserving image aspect ratio and original bytes.
export function UiImage({ number, className = '' }: { number?: number; className?: string }) {
 const image = number && UI_IMAGES[number];
 if (!image) return null;
 return <svg className={`ui-image ${className}`} data-ui-image={number} viewBox={image.viewBox.join(' ')} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><image href={uiImageUrl(number!)} width={image.width} height={image.height} /></svg>;
}
