"""Prepare approved PNG masters without regenerating or repainting characters.
Usage: PYTHONPATH=/tmp/castle-image-tools python scripts/prepare-castle-assets.py INPUT_DIRECTORY
Requires Pillow, NumPy, SciPy, OpenCV. Only witch RGB receives background removal.
"""
import sys,json,shutil,hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage as ndi
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1])
OUT=ROOT/'reports/castle-ui-png'
for folder in [ROOT/'assets/characters/masters',ROOT/'assets/characters/castle',OUT]:folder.mkdir(parents=True,exist_ok=True)
names=['01_black_swordsman','02_heavy_knight','03_witch','04_big_man','05_scout','06_sage']
faces=[(365,0,690,325),(370,0,700,330),(390,125,720,455),(380,10,720,350),(400,0,760,360),(360,0,720,360)]
expected=['57cc182b1f38','d1ababb415c9','a8a9914ae5d6','eed30a948db1','594a5d3e3356','5f714876dfb9']
def input_file(name):
    exact=SOURCE/name
    return exact if exact.exists() else next(SOURCE.glob('*-'+name))
def remove_witch_background(rgb,reference):
    import cv2
    # Reference supplies mask seeds only. All output RGB comes from the corrected-hand master.
    ref=np.array(reference)[:,:,3]
    mask=np.where(ref>120,cv2.GC_PR_FGD,cv2.GC_PR_BGD).astype('uint8')
    mask[ndi.binary_erosion(ref>235,iterations=5)]=cv2.GC_FGD
    mask[~ndi.binary_dilation(ref>10,iterations=7)]=cv2.GC_BGD
    # Revised left hand differs from the reference. Re-segment this region from latest RGB.
    mask[540:700,210:375]=cv2.GC_PR_BGD
    poly=np.array([(240,579),(274,581),(300,576),(330,584),(348,609),(329,629),(276,662),(238,671),(221,656),(232,639),(256,622),(272,611),(240,600)],'int32')
    cv2.fillPoly(mask,[poly],cv2.GC_PR_FGD)
    roi=rgb[540:700,210:375].astype(float)
    skin=(roi[:,:,0]>roi[:,:,2]*1.18)&(roi[:,:,0]>150)
    mask[540:700,210:375][skin]=cv2.GC_FGD
    cv2.setRNGSeed(7)
    cv2.grabCut(rgb,mask,None,np.zeros((1,65)),np.zeros((1,65)),4,cv2.GC_INIT_WITH_MASK)
    fg=(mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD)
    alpha=ndi.gaussian_filter(fg.astype(float),.55)
    alpha[ndi.binary_erosion(fg,iterations=2)]=1
    return Image.fromarray(np.dstack([rgb,np.clip(alpha*255,0,255).astype('uint8')]))
manifest={'source':'Approved 1024x1536 PNG masters, 2026-11-06; five original alphas preserved; latest witch RGB segmented','characters':[]}
sheet=Image.new('RGB',(1200,650),'#192633');draw=ImageDraw.Draw(sheet)
quality=Image.new('RGB',(1800,860));qd=ImageDraw.Draw(quality)
for i,(name,face,digest) in enumerate(zip(names,faces,expected)):
    src=input_file(name+'.png')
    assert hashlib.sha256(src.read_bytes()).hexdigest().startswith(digest),src.name
    master=ROOT/'assets/characters/masters'/(name+'.png');shutil.copyfile(src,master)
    im=Image.open(master)
    boss=ROOT/'assets/characters/castle'/(name+'_boss.png')
    if name=='03_witch':
        alt=input_file('03_witch_before_hand_fix_transparent.png')
        rgba=remove_witch_background(np.array(im),Image.open(alt))
        rgba.save(boss,optimize=True)
    else:
        assert im.mode=='RGBA'
        shutil.copyfile(master,boss)  # Identical bytes: no re-matting, cropping or resampling.
        rgba=im.copy()
    paths={}
    for pose in ['boss','face','bust']:
        path=ROOT/'assets/characters/castle'/(name+'_'+pose+'.png')
        if pose=='face':rgba.crop(face).resize((256,256),Image.Resampling.LANCZOS).save(path,optimize=True)
        if pose=='bust':
            bust=rgba.crop((0,0,1024,940));bust.thumbnail((768,940),Image.Resampling.LANCZOS);bust.save(path,optimize=True)
        img=Image.open(path);paths[pose]={'path':str(path.relative_to(ROOT)),'width':img.width,'height':img.height,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    thumb=rgba.copy();thumb.thumbnail((190,470));sheet.paste(thumb,(i*200+(200-thumb.width)//2,25),thumb)
    icon=Image.open(ROOT/paths['face']['path']).resize((120,120));sheet.paste(icon,(i*200+40,510),icon)
    draw.text((i*200+3,5),name,fill='#eed6a5')
    for j,color in enumerate(['#192633','#e7e2d9']):
        tile=Image.new('RGB',(300,430),color);preview=rgba.copy();preview.thumbnail((280,420));tile.paste(preview,((300-preview.width)//2,5),preview);quality.paste(tile,(i*300,j*430))
    manifest['characters'].append({'id':'04_giant_warrior' if name=='04_big_man' else name,'source':src.name,'master':str(master.relative_to(ROOT)),'master_sha256':hashlib.sha256(master.read_bytes()).hexdigest(),'originalMode':im.mode,'originalAlphaPreserved':name!='03_witch','images':paths})
(ROOT/'assets/characters/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# Reference is retained separately, never selected as an active character image.
refs=ROOT/'assets/characters/references';refs.mkdir(exist_ok=True)
shutil.copyfile(input_file('03_witch_before_hand_fix_transparent.png'),refs/'03_witch_before_hand_fix_transparent.png')
shutil.copyfile(input_file('README.md'),ROOT/'assets/characters/masters/README.md')
sheet.save(OUT/'character-sheet.png');quality.save(OUT/'alpha-dark-light.png')
