#!/usr/bin/env python3
"""Rebuild/check the 33 approved delivery images. Requires Pillow 13.0.0 + WebP.
PNG originals, dimensions and UI viewBoxes are never modified.
"""
import argparse
import csv
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageChops, ImageStat, features, __version__

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / 'apps/game-web/ui-image-assets.json'
CSV = ROOT / 'docs/assets/ui-image-inventory.csv'
AUDIT = ROOT / 'docs/assets/ui-webp-validation.json'
QUALITY = 98

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def inspect(pair, check):
    number, item = pair
    source = ROOT / item['path']
    expected = 'assets/ui-webp/' + item['path'].removeprefix('assets/ui/').removesuffix('.png') + '.webp'
    if not item['path'].startswith('assets/ui/') or item['deliveryPath'] != expected or '..' in Path(expected).parts:
        raise ValueError('Unexpected image path: ' + number)
    target = ROOT / expected
    original = Image.open(source).convert('RGBA')
    if not check:
        target.parent.mkdir(parents=True, exist_ok=True)
        original.save(target, format='WEBP', quality=QUALITY, method=6, exact=True)
    delivered = Image.open(target).convert('RGBA')
    if original.size != delivered.size or original.size != (item['width'], item['height']):
        raise ValueError('Dimension mismatch: ' + number)
    if original.getchannel('A').tobytes() != delivered.getchannel('A').tobytes():
        raise ValueError('Alpha mismatch: ' + number)
    rms = {}
    for name, color in [('dark', (20, 24, 28, 255)), ('light', (240, 240, 240, 255))]:
        background = Image.new('RGBA', original.size, color)
        a = Image.alpha_composite(background, original).convert('RGB')
        b = Image.alpha_composite(background, delivered).convert('RGB')
        rms[name] = [round(value, 6) for value in ImageStat.Stat(ImageChops.difference(a, b)).rms]
    return {'id': number, 'source': item['path'], 'delivery': expected, 'sourceSha256': digest(source), 'deliverySha256': digest(target),
            'sourceBytes': source.stat().st_size, 'deliveryBytes': target.stat().st_size, 'width': original.width, 'height': original.height,
            'alphaExact': True, 'rgbaExact': original.tobytes() == delivered.tobytes(), 'compositeChannelRms': rms}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Decode/verify existing derivatives and recorded provenance without writing')
    args = parser.parse_args()
    items = json.loads(CATALOG.read_text())
    if len(items) != 33:
        raise ValueError('Expected exactly 33 approved UI images')
    rows = list(csv.DictReader(CSV.open(encoding='utf-8-sig')))
    for row in rows:
        if digest(ROOT / row['新ファイル']) != row['SHA256']:
            raise ValueError('Original modified: ' + row['仮ID'])
    if not args.check:
        # Only replace files whose previous recorded digest still matches.
        recorded = {row['配信ファイル']: row.get('配信SHA256') for row in rows if row.get('配信ファイル')}
        known = {item['deliveryPath'] for item in items.values()}
        for path in known:
            if (ROOT / path).exists() and (path not in recorded or digest(ROOT / path) != recorded[path]):
                raise ValueError('Unrecorded/modified derivative preserved: ' + path)
        for path in (ROOT / 'assets/ui-webp').rglob('*'):
            if path.is_file() and path.relative_to(ROOT).as_posix() not in known:
                raise ValueError('Unknown derivative preserved: ' + str(path))
    with ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(lambda pair: inspect(pair, args.check), items.items()))
    before = sum(row['sourceBytes'] for row in records)
    after = sum(row['deliveryBytes'] for row in records)
    by_id = {int(row['id']): row for row in records}
    if args.check:
        previous = json.loads(AUDIT.read_text())
        if previous['images'] != records:
            raise ValueError('Recorded image measurements differ from decoded files')
        for row in rows:
            image = by_id.get(int(row['仮ID']))
            if image and (row['配信ファイル'] != image['delivery'] or row['配信SHA256'] != image['deliverySha256']):
                raise ValueError('CSV delivery mismatch: ' + row['仮ID'])
    else:
        audit = {'format': 'throne-ui-image-validation-v1', 'encoder': {'pillow': __version__, 'libwebp': features.version('webp'), 'quality': QUALITY, 'method': 6, 'exact': True, 'lossless': False},
                 'count': len(records), 'sourceBytes': before, 'deliveryBytes': after, 'reductionPercent': round(100 * (1 - after / before), 6), 'images': records}
        AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
        fields = list(rows[0])
        extra = ['配信形式', '配信ファイル', '原本Bytes', '配信Bytes', '削減率Percent', '配信SHA256', '配信品質確認']
        fields += [key for key in extra if key not in fields]
        for row in rows:
            image = by_id.get(int(row['仮ID']))
            row.update(dict.fromkeys(extra, ''))
            row['原本Bytes'] = str((ROOT / row['新ファイル']).stat().st_size)
            if image:
                row.update({'配信形式': 'WebP Q98', '配信ファイル': image['delivery'], '配信Bytes': str(image['deliveryBytes']), '削減率Percent': f"{100*(1-image['deliveryBytes']/image['sourceBytes']):.2f}", '配信SHA256': image['deliverySha256'], '配信品質確認': '寸法・alpha完全一致／RGB非可逆／Chromium比較は台帳参照'})
            else:
                row['配信形式'] = '配信対象外（PNG原本保持）'
        with CSV.open('w', encoding='utf-8-sig', newline='') as stream:
            writer = csv.DictWriter(stream, fields, lineterminator='\n')
            writer.writeheader(); writer.writerows(rows)
    print(f"{len(records)} images: {before:,} -> {after:,} bytes; {100*(1-after/before):.2f}% reduction. Alpha/dimensions exact.")

if __name__ == '__main__':
    main()
