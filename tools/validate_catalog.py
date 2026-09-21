import json,re,sys
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parent.parent
ID=re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
DATE=re.compile(r'^\d{4}-\d{2}-\d{2}$')
STAT={'active','beta','coming-soon'}

def load(p):
    with p.open(encoding='utf-8') as f:return json.load(f)

def main():
    errors=[]; cats=load(ROOT/'portfolio/categories.json').get('categories',[]); ids=set(); total=0
    if not isinstance(cats,list): errors.append('categories must be an array'); cats=[]
    for ci,c in enumerate(cats):
        if not isinstance(c,dict): errors.append(f'categories[{ci}] must be object'); continue
        key=c.get('key',''); src=c.get('source','')
        if not ID.fullmatch(key): errors.append(f'categories[{ci}] invalid key')
        p=(ROOT/src).resolve()
        try:p.relative_to(ROOT)
        except ValueError: errors.append(f'{key}: source outside root'); continue
        try:items=load(p).get('items',[])
        except Exception as e: errors.append(f'{src}: {e}'); continue
        if not isinstance(items,list): errors.append(f'{src}: items must be array'); continue
        for ii,x in enumerate(items):
            ctx=f'{key}[{ii}]'; total+=1
            if not isinstance(x,dict): errors.append(f'{ctx}: not object'); continue
            ident=x.get('id','')
            if not ID.fullmatch(ident): errors.append(f'{ctx}: invalid id')
            if ident in ids: errors.append(f'{ctx}: duplicate id {ident}')
            ids.add(ident)
            for f in ('name','shortDescription'):
                if not isinstance(x.get(f),str) or not x[f].strip(): errors.append(f'{ctx}: missing {f}')
            if x.get('status','active') not in STAT: errors.append(f'{ctx}: invalid status')
            d=x.get('updatedAt')
            if d and (not isinstance(d,str) or not DATE.fullmatch(d)): errors.append(f'{ctx}: invalid updatedAt')
            for f in ('repoUrl','liveUrl'):
                u=x.get(f)
                if u:
                    q=urlparse(u)
                    if q.scheme not in ('http','https'): errors.append(f'{ctx}: invalid {f}')
            for f in ('tags','features'):
                v=x.get(f,[])
                if not isinstance(v,list) or not all(isinstance(s,str) for s in v): errors.append(f'{ctx}: invalid {f}')
    if errors:
        print('Catalog validation failed:')
        for e in errors: print('- '+e)
        return 1
    print(f'Catalog valid: {len(cats)} categories, {total} unique projects')
    return 0
if __name__=='__main__': sys.exit(main())
