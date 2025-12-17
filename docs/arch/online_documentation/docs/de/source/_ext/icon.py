from docutils import nodes
from docutils.parsers.rst import directives, Directive, roles
import os

ICON_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "_static", "icons")
print(f"DEBUG: Looking for icons in: {ICON_DIR}")
print(f"DEBUG: __file__ is: {__file__}")
print(f"DEBUG: Directory exists: {os.path.exists(ICON_DIR)}")
if os.path.exists(ICON_DIR):
    print(f"DEBUG: Files in directory: {os.listdir(ICON_DIR)}")

def get_icon_svg(icon_name):
    """Helper function to load and process SVG"""
    path = os.path.join(ICON_DIR, f"{icon_name}.svg")
    print(f"DEBUG: Looking for icon at: {path}")
    print(f"DEBUG: File exists: {os.path.exists(path)}")
    
    if not os.path.exists(path):
        return None
    
    with open(path, "r", encoding="utf-8") as f:
        svg = f.read()
        svg = svg.replace('class="size-6"', '')
        svg = svg.replace("<svg", '<svg class="inline-icon"')
    return svg

class IconDirective(Directive):
    required_arguments = 1  # icon name
    has_content = False
    
    def run(self):
        icon_name = self.arguments[0]
        svg = get_icon_svg(icon_name)
        
        if svg is None:
            error = self.state_machine.reporter.error(f"Icon '{icon_name}' not found.")
            return [error]
        
        return [nodes.raw('', svg, format='html')]

def icon_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    """Inline icon role"""
    icon_name = text.strip()
    svg = get_icon_svg(icon_name)
    
    if svg is None:
        msg = inliner.reporter.error(f"Icon '{icon_name}' not found.", line=lineno)
        prb = inliner.problematic(rawtext, rawtext, msg)
        return [prb], [msg]
    
    node = nodes.raw('', svg, format='html')
    return [node], []

def setup(app):
    app.add_directive("icon", IconDirective)
    app.add_role("icon", icon_role)
    
    return {
        'version': '0.1',
        'parallel_read_safe': True,
        'parallel_write_safe': True,
    }