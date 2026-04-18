import re

with open('src/app/admin/quiz/page.tsx', 'r') as f:
    content = f.read()

def convert_class(cls):
    match = re.match(r'^([pm])([xtrbl])?-?(.*)$', cls)
    if not match: return None
    
    prop_type, direction, val_str = match.groups()
    if prop_type not in ['p', 'm']: return None
    
    # parse val
    if val_str.startswith('['):
        val = val_str[1:-1]
    else:
        try:
            val = str(float(val_str) * 4) + 'px'
        except:
            return None
            
    prop_prefix = 'padding' if prop_type == 'p' else 'margin'
    
    if direction == 'x':
        return f'{prop_prefix}Left: "{val}", {prop_prefix}Right: "{val}"'
    elif direction == 'y':
        return f'{prop_prefix}Top: "{val}", {prop_prefix}Bottom: "{val}"'
    elif direction == 't':
        return f'{prop_prefix}Top: "{val}"'
    elif direction == 'b':
        return f'{prop_prefix}Bottom: "{val}"'
    elif direction == 'l':
        return f'{prop_prefix}Left: "{val}"'
    elif direction == 'r':
        return f'{prop_prefix}Right: "{val}"'
    else:
        return f'{prop_prefix}: "{val}"'

def process_match(m):
    classes_str = m.group(1)
    classes = classes_str.split()
    
    remaining_classes = []
    style_props = []
    
    for c in classes:
        # Avoid matching non spacing ones if possible
        if c.startswith(('p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-', 'm-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-', 'p0', 'm0')):
            converted = convert_class(c)
            if converted:
                style_props.append(converted)
            else:
                remaining_classes.append(c)
        elif re.match(r'^[pm][xtrbl]?-\d', c) or re.match(r'^[pm][xtrbl]?-\[', c):
            converted = convert_class(c)
            if converted:
                style_props.append(converted)
            else:
                remaining_classes.append(c)
        else:
            remaining_classes.append(c)
            
    new_class_str = " ".join(remaining_classes)
    
    return f'className="{new_class_str}"' + (f' data-inject-styles="{{ {", ".join(style_props)} }}"' if style_props else '')

# Find all className="..."
new_content = re.sub(r'className="([^"]+)"', process_match, content)

# inject styles into existing style={{...}} or create new ones
def inject_styles(m):
    full_str = m.group(0)
    class_match = re.search(r'className="[^"]*"', full_str)
    styles_inject_match = re.search(r'data-inject-styles="\{ ([^}]+) \}"', full_str)
    
    if not styles_inject_match:
        return full_str
        
    injected_styles = styles_inject_match.group(1)
    
    # remove the data attr
    clean_str = re.sub(r'\s*data-inject-styles="[^"]+"', '', full_str)
    
    # does it have a style={{}}?
    style_match = re.search(r'style=\{\{\s*(.*?)\s*\}\}', clean_str)
    if style_match:
        existing_styles = style_match.group(1)
        if existing_styles.strip():
            combined = existing_styles + (', ' if not existing_styles.endswith(',') else '') + injected_styles
        else:
            combined = injected_styles
        clean_str = clean_str[:style_match.start(1)] + combined + clean_str[style_match.end(1):]
    else:
        # add style attr
        # find the end of className
        class_end = re.search(r'className="[^"]*"', clean_str).end()
        clean_str = clean_str[:class_end] + f' style={{{{{injected_styles}}}}}' + clean_str[class_end:]
        
    return clean_str

# Split by JSX elements to easily find them
new_content2 = re.sub(r'<[a-zA-Z0-9]+[^>]*className="[^"]*"[^>]*>', inject_styles, new_content)

print(new_content2)
with open('src/app/admin/quiz/page.tsx', 'w') as f:
    f.write(new_content2)
