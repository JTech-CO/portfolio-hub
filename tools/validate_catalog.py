import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
CATEGORY_INDEX = ROOT / "portfolio" / "categories.json"
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VALID_STATUSES = {"active", "beta", "coming-soon"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".webp"}


def load_json(path):
    try:
        with path.open(encoding="utf-8") as file:
            return json.load(file)
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"{path.relative_to(ROOT)}: {error}") from error


def resolve_source(relative_path):
    source = (ROOT / relative_path).resolve()
    try:
        source.relative_to(ROOT)
    except ValueError as error:
        raise ValueError(f"Source is outside the project: {relative_path}") from error
    return source


def validate_item(item, context, seen_ids, errors):
    if not isinstance(item, dict):
        errors.append(f"{context}: item must be an object")
        return

    item_id = item.get("id")
    if not isinstance(item_id, str) or not ID_PATTERN.fullmatch(item_id):
        errors.append(f"{context}: invalid id")
    elif item_id in seen_ids:
        errors.append(f"{context}: duplicate id '{item_id}'")
    else:
        seen_ids.add(item_id)

    for field in ("name", "shortDescription"):
        if not isinstance(item.get(field), str) or not item[field].strip():
            errors.append(f"{context}: {field} is required")

    status = item.get("status", "active")
    if status not in VALID_STATUSES:
        errors.append(f"{context}: invalid status '{status}'")

    for field in ("tags", "features"):
        value = item.get(field, [])
        if not isinstance(value, list) or not all(isinstance(entry, str) for entry in value):
            errors.append(f"{context}: {field} must be a string array")

    url = item.get("url")
    if url:
        parsed = urlparse(url)
        if parsed.scheme and parsed.scheme not in {"http", "https"}:
            errors.append(f"{context}: unsupported URL protocol")

    icon = item.get("icon", "")
    if isinstance(icon, str) and Path(icon.split("?", 1)[0]).suffix.lower() in IMAGE_EXTENSIONS:
        icon_path = resolve_source(icon)
        if not icon_path.is_file():
            errors.append(f"{context}: icon file not found: {icon}")


def validate():
    errors = []
    payload = load_json(CATEGORY_INDEX)
    categories = payload.get("categories") if isinstance(payload, dict) else None
    if not isinstance(categories, list):
        return ["portfolio/categories.json: categories must be an array"], 0, 0

    seen_keys = set()
    total_items = 0
    for index, category in enumerate(categories):
        context = f"categories[{index}]"
        if not isinstance(category, dict):
            errors.append(f"{context}: category must be an object")
            continue

        key = category.get("key")
        source_value = category.get("source")
        if not isinstance(key, str) or not ID_PATTERN.fullmatch(key):
            errors.append(f"{context}: invalid key")
            continue
        if key in seen_keys:
            errors.append(f"{context}: duplicate key '{key}'")
        seen_keys.add(key)
        if not isinstance(source_value, str) or not source_value:
            errors.append(f"{context}: source is required")
            continue

        try:
            source = resolve_source(source_value)
            data = load_json(source)
        except ValueError as error:
            errors.append(str(error))
            continue

        items = data.get("items") if isinstance(data, dict) else None
        if not isinstance(items, list):
            errors.append(f"{source_value}: items must be an array")
            continue

        seen_ids = set()
        for item_index, item in enumerate(items):
            validate_item(item, f"{key}[{item_index}]", seen_ids, errors)
        total_items += len(items)

    return errors, len(categories), total_items


if __name__ == "__main__":
    validation_errors, category_count, item_count = validate()
    if validation_errors:
        print("Catalog validation failed:")
        for message in validation_errors:
            print(f"- {message}")
        sys.exit(1)
    print(f"Catalog valid: {category_count} categories, {item_count} items")
