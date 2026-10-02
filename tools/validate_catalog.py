import json
import re
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
ID = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
DATE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
STATUSES = {'active', 'beta', 'coming-soon'}


def load(path):
    with path.open(encoding='utf-8') as file:
        return json.load(file)


def main():
    errors = []
    category_payload = load(ROOT / 'portfolio/categories.json')
    categories = category_payload.get('categories', [])
    ids = set()
    catalog_items = []
    total = 0

    if not isinstance(categories, list):
        errors.append('categories must be an array')
        categories = []

    for category_index, category in enumerate(categories):
        if not isinstance(category, dict):
            errors.append(f'categories[{category_index}] must be object')
            continue

        key = category.get('key', '')
        source = category.get('source', '')
        if not ID.fullmatch(key):
            errors.append(f'categories[{category_index}] invalid key')

        for field in ('label', 'description'):
            if not isinstance(category.get(field), str) or not category[field].strip():
                errors.append(f'categories[{category_index}] missing {field}')

        path = (ROOT / source).resolve()
        try:
            path.relative_to(ROOT)
        except ValueError:
            errors.append(f'{key}: source outside root')
            continue

        try:
            items = load(path).get('items', [])
        except Exception as error:
            errors.append(f'{source}: {error}')
            continue

        if not isinstance(items, list):
            errors.append(f'{source}: items must be array')
            continue

        for item_index, item in enumerate(items):
            context = f'{key}[{item_index}]'
            total += 1
            if not isinstance(item, dict):
                errors.append(f'{context}: not object')
                continue
            catalog_items.append(item)

            identifier = item.get('id', '')
            if not ID.fullmatch(identifier):
                errors.append(f'{context}: invalid id')
            if identifier in ids:
                errors.append(f'{context}: duplicate id {identifier}')
            ids.add(identifier)

            for field in ('name', 'shortDescription'):
                if not isinstance(item.get(field), str) or not item[field].strip():
                    errors.append(f'{context}: missing {field}')
                elif len(item[field]) > (128 if field == 'name' else 600):
                    errors.append(f'{context}: {field} exceeds length limit')

            if item.get('status', 'active') not in STATUSES:
                errors.append(f'{context}: invalid status')

            updated_at = item.get('updatedAt')
            if updated_at and (not isinstance(updated_at, str) or not DATE.fullmatch(updated_at)):
                errors.append(f'{context}: invalid updatedAt')

            for field in ('repoUrl', 'liveUrl'):
                value = item.get(field)
                if value:
                    parsed = urlparse(value)
                    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
                        errors.append(f'{context}: invalid {field}')

            for field in ('tags', 'features'):
                value = item.get(field, [])
                if not isinstance(value, list) or not all(isinstance(entry, str) for entry in value):
                    errors.append(f'{context}: invalid {field}')

    snapshot = load(ROOT / 'portfolio/sync-snapshot.json')
    snapshot_date = date.fromisoformat(snapshot['snapshotDate'])
    repositories = {repo['repoUrl']: repo for repo in snapshot['repositories']}
    excluded = {repo['name'].casefold() for repo in snapshot['excludedRepositories']}
    repo_urls = set()
    kst = timezone(timedelta(hours=9))
    for item in catalog_items:
        context = item['id']
        repo_url = item.get('repoUrl')
        repo = repositories.get(repo_url)
        repo_name = urlparse(repo_url or '').path.rsplit('/', 1)[-1].casefold()
        if repo_name.startswith('smart-cart') or repo_name in excluded:
            errors.append(f'{context}: excluded capstone repository')
        if not repo or repo.get('fork') is not False:
            errors.append(f'{context}: not an original snapshot repository')
            continue
        if repo_url in repo_urls:
            errors.append(f'{context}: duplicate repository')
        repo_urls.add(repo_url)
        pushed_at = item.get('pushedAt', '')
        if pushed_at != repo['pushedAt']:
            errors.append(f'{context}: pushedAt differs from snapshot')
        try:
            pushed = datetime.strptime(pushed_at, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
            updated = date.fromisoformat(item.get('updatedAt', ''))
            if updated != pushed.astimezone(kst).date():
                errors.append(f'{context}: updatedAt must use pushedAt in KST')
            if updated > snapshot_date:
                errors.append(f'{context}: updatedAt after snapshot')
        except (TypeError, ValueError):
            errors.append(f'{context}: invalid calendar date or push timestamp')
    missing = set(repositories) - repo_urls
    if missing:
        errors.append('snapshot repositories missing from catalog: ' + ', '.join(sorted(missing)))
    counts = snapshot['repositoryCounts']
    if total != counts['included'] or total != len(repositories):
        errors.append('catalog count differs from snapshot')
    if counts['original'] != counts['included'] + len(excluded):
        errors.append('original repository count does not reconcile')
    if counts['public'] != counts['original'] + counts['forks']:
        errors.append('public repository count does not reconcile')
    hero = (ROOT / 'index.html').read_text(encoding='utf-8')
    if snapshot['snapshotDate'].replace('-', '.') not in hero:
        errors.append('hero date differs from snapshot')

    if errors:
        print('Catalog validation failed:')
        for error in errors:
            print('- ' + error)
        return 1

    print(f'Catalog valid: {len(categories)} categories, {total} unique projects')
    return 0


if __name__ == '__main__':
    sys.exit(main())
