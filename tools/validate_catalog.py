import json
import re
import sys
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

            identifier = item.get('id', '')
            if not ID.fullmatch(identifier):
                errors.append(f'{context}: invalid id')
            if identifier in ids:
                errors.append(f'{context}: duplicate id {identifier}')
            ids.add(identifier)

            for field in ('name', 'shortDescription'):
                if not isinstance(item.get(field), str) or not item[field].strip():
                    errors.append(f'{context}: missing {field}')

            if item.get('status', 'active') not in STATUSES:
                errors.append(f'{context}: invalid status')

            updated_at = item.get('updatedAt')
            if updated_at and (not isinstance(updated_at, str) or not DATE.fullmatch(updated_at)):
                errors.append(f'{context}: invalid updatedAt')

            for field in ('repoUrl', 'liveUrl'):
                value = item.get(field)
                if value:
                    parsed = urlparse(value)
                    if parsed.scheme not in ('http', 'https'):
                        errors.append(f'{context}: invalid {field}')

            for field in ('tags', 'features'):
                value = item.get(field, [])
                if not isinstance(value, list) or not all(isinstance(entry, str) for entry in value):
                    errors.append(f'{context}: invalid {field}')

    if errors:
        print('Catalog validation failed:')
        for error in errors:
            print('- ' + error)
        return 1

    print(f'Catalog valid: {len(categories)} categories, {total} unique projects')
    return 0


if __name__ == '__main__':
    sys.exit(main())
