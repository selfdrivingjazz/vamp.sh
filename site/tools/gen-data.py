"""Regenerate data.js from the real sources: the schema bundle
(`cargo run -p vamp-protocol --example schema` in the protocol repo), its contract.json,
and `vamp commands` (the vamp CLI from the same repo, on PATH).

    python3 tools/gen-data.py [path/to/vamp-protocol-repo]   # default: ../vamp beside vamp.sh
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '../../../vamp'))
OUT = os.path.join(HERE, '..', 'data.js')
S = json.loads(subprocess.run(['cargo', 'run', '-q', '-p', 'vamp-protocol', '--example', 'schema'],
                              cwd=REPO, capture_output=True, text=True, check=True).stdout)
C = json.load(open(os.path.join(REPO, 'crates/vamp-protocol/protocol/contract.json')))

class More:
    def __init__(self, n): self.n = n

def cut(s, n=88):
    s = s.replace('\n', ' ')
    return s if len(s) <= n else s[: n - 1].rstrip() + '…'

def emit(v, ind=0):
    p = '  ' * ind
    if isinstance(v, More):
        return f'… {v.n} more' if v.n else '…'
    if isinstance(v, dict):
        if not v: return '{}'
        if all(not isinstance(x, (dict, list)) or (isinstance(x, list) and all(not isinstance(y, (dict, list)) for y in x)) for x in v.values()):
            flat = '{ ' + ', '.join(emit(x) if isinstance(x, More) else json.dumps(k) + ': ' + emit(x) for k, x in v.items()) + ' }'
            if len(flat) < 56 and len(v) <= 2:
                return flat
        rows = []
        for k, x in v.items():
            if isinstance(x, More):
                rows.append(p + '  ' + emit(x))
            else:
                rows.append(p + '  ' + json.dumps(k) + ': ' + emit(x, ind + 1))
        return '{\n' + ',\n'.join(rows) + '\n' + p + '}'
    if isinstance(v, list):
        if all(not isinstance(x, (dict, list)) for x in v):
            flat = '[' + ', '.join(emit(x) for x in v) + ']'
            if len(flat) < 84:
                return flat
        return '[\n' + ',\n'.join(p + '  ' + emit(x, ind + 1) for x in v) + '\n' + p + ']'
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    return json.dumps(v)

def slim_prop(p):
    if not isinstance(p, dict):
        return p
    out = {}
    for k in ('$ref', 'type', 'enum', 'format', 'default', 'description'):
        if k in p:
            out[k] = cut(p[k]) if k == 'description' else p[k]
    if 'items' in p and isinstance(p['items'], dict) and 'type' in p['items']:
        out['items'] = {'type': p['items']['type']}
    if 'allOf' in p: out['allOf'] = p['allOf']
    if 'anyOf' in p: out['anyOf'] = p['anyOf']
    return out

PICK = {
    'asset': ['id', 'revision', 'original', 'metadata'],
    'asset_view': ['asset', 'representations', 'observations', 'suggested_tags'],
    'collection': ['id', 'name', 'parent_id', 'asset_ids'],
    'context': ['library_id', 'state_dir', 'remote'],
    'duplicate_candidate': ['blake3', 'matches'],
    'error': ['error', 'protocol_version'],
    'event': ['sequence', 'kind', 'actor', 'revision', 'payload'],
    'job': ['status', 'processor', 'source_hash', 'lease'],
    'metadata_patch': ['tags', 'add_tags', 'rating', 'description'],
    'processor': ['command', 'events', 'input', 'output', 'placement'],
    'smart_folder': ['id', 'name', 'rules'],
    'store_request': ['operation', 'bucket', 'key', 'blake3'],
    'store_response': ['blake3', 'byte_size', 'exists', 'url'],
    'tag_group': ['id', 'name', 'tags', 'color'],
    'tool_request': ['protocol_version', 'operation', 'asset', 'input_path'],
    'tool_response': ['observation', 'palette', 'representation', 'tiles'],
}

NOTE = {
    'asset': 'The catalog record: a stable UUID independent of path, a revision that advances on metadata change, the original referenced in place.',
    'asset_view': 'An asset together with its representations (thumbnail, preview) and the observations processors added.',
    'collection': S['collection'].get('description'),
    'context': 'Machine-local connection configuration, not a library: which library, where its state lives, an optional remote.',
    'contract': 'The semantic and operation contract, bundled whole into the schema output.',
    'duplicate_candidate': cut(S['duplicate_candidate'].get('description'), 140),
    'error': 'Every failure is JSON on stderr with a nonzero exit.',
    'event': 'One ordered change. Monotonic sequence within a library; consumers keep their last sequence and ask for later events.',
    'job': 'Durable processor work: pending, running, completed or failed.',
    'metadata_patch': 'Omitted or null fields are unchanged. Pair it with --expected-revision to reject stale writes.',
    'processor': 'An explicitly registered local executable. Arguments go straight to it, never through a shell.',
    'protocol_version': 'The wire version.',
    'smart_folder': 'A saved rule set, evaluated on browse.',
    'store_request': cut(S['store_request'].get('description'), 140),
    'store_response': 'The vamp-store helper’s one reply on stdout.',
    'tag_group': S['tag_group'].get('description'),
    'tool_request': S['tool_request'].get('description'),
    'tool_response': 'What a processor hands back: an observation, a palette, a representation or contact-sheet tiles.',
}

schema = []
for root, sch in S.items():
    if root == 'protocol_version':
        text = emit(sch)
        nprops = 0
    elif root == 'contract':
        ex = {
            'protocol_version': sch['protocol_version'],
            'status': sch['status'],
            'binding': sch['binding'],
            'mutations': {'precondition': cut(sch['mutations']['precondition'], 100), '_': More(len(sch['mutations']) - 1)},
            'events': {'kinds': sch['events']['kinds'][:6] + [More(len(sch['events']['kinds']) - 6)],
                       'ordering': cut(sch['events']['ordering'], 100), '_': More(len(sch['events']) - 2)},
            '_': More(len(sch) - 5),
        }
        text = emit(ex)
        nprops = len(sch)
    else:
        props = sch.get('properties', {})
        ex = {'title': sch['title']}
        if sch.get('description'): ex['description'] = cut(sch['description'], 100)
        ex['type'] = sch.get('type')
        if sch.get('required'): ex['required'] = sch['required']
        pp = {}
        for k in PICK[root]:
            pp[k] = slim_prop(props[k])
        rest = len(props) - len(pp)
        if rest: pp['_'] = More(rest)
        ex['properties'] = pp
        if sch.get('$defs'): ex['$defs'] = {'_': More(len(sch['$defs']))}
        text = emit(ex)
        nprops = len(props)
    defs = list(sch.get('$defs', {}).keys()) if isinstance(sch, dict) else []
    title = sch.get('title') if isinstance(sch, dict) else None
    schema.append({'root': root, 'title': title or root, 'note': NOTE[root], 'props': nprops,
                   'required': len(sch.get('required') or []) if isinstance(sch, dict) else 0,
                   'defs': defs, 'json': text})

# Contract names
SKIP_NATIVE = {'binding', 'browse_item', 'media_helper', 'cli', 'eagle_import'}
native_ops = [k for k in C['native'] if k not in SKIP_NATIVE]
endpoints = list(C['remote']['endpoints'].keys())

# CLI command tree (names only) from `vamp commands`
cmd = json.loads(subprocess.run(['vamp', 'commands'], capture_output=True, text=True, check=True).stdout)['command']
cli = []
for s in cmd['subcommands']:
    if s['name'] == 'help': continue
    subs = [x['name'] for x in s.get('subcommands', []) if x['name'] != 'help']
    cli.append({'name': s['name'], 'about': cut(s.get('about') or '', 96), 'subs': subs})

data = {
    'protocol_version': C['protocol_version'],
    'status': C['status'],
    'binding': C['binding'],
    'event_kinds': C['events']['kinds'],
    'job_states': C['processors']['job_states'],
    'triggers': C['processors']['triggers'],
    'error_codes': C['errors']['codes'],
    'native_ops': native_ops,
    'endpoints': endpoints,
    'cli': cli,
    'facts': {
        'original': cut(C['identity']['original'], 400),
        'asset': C['identity']['asset'],
        'revision': C['mutations']['revision'],
        'precondition': C['mutations']['precondition'],
        'ordering': C['events']['ordering'],
        'authority': C['storage']['authority'],
        'replay': C['events']['replay'],
        'trust': C['processors']['trust'],
        'response': C['processors']['response'],
        'actor': C['events']['actor'],
    },
    'schema': schema,
}

open(OUT, 'w').write('/* Generated from the VAMP schema bundle, contract.json and `vamp commands`. Do not edit by hand. */\n'
                     'window.VAMP_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print('wrote', OUT, os.path.getsize(OUT))
