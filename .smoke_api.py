import json, urllib.request, urllib.error, uuid
from datetime import datetime

BASE = 'http://localhost:3000'
created_id = None


def excerpt(data, limit=700):
    if data is None:
        return ''
    try:
        text = json.dumps(data, ensure_ascii=False)
    except Exception:
        text = str(data)
    return text if len(text) <= limit else text[:limit] + '...'


def do_json(method, path, payload=None, headers=None):
    headers = headers or {}
    body = None
    if payload is not None:
        body = json.dumps(payload).encode()
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(BASE + path, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode('utf-8', errors='replace')
            ctype = resp.headers.get('content-type', '')
            data = json.loads(raw) if 'json' in ctype or raw[:1] in '[{' else raw
            return resp.status, data
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', errors='replace')
        try:
            data = json.loads(raw)
        except Exception:
            data = raw
        return e.code, data
    except Exception as e:
        return 'ERROR', {'error': str(e)}
