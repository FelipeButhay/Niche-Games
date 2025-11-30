import flask as f
import os

def register_filters(app):
    
    @app.template_filter("get_svg")
    def get_svg(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                base_name = os.path.basename(file_path).rsplit(".", 1)[0]
                svg = file.read()
                svg = svg.replace("<svg", f'<symbol id="{base_name}-icon" transform="translate(50, 50)"')\
                         .replace("</svg>", "</symbol>")
                
                svg_parts1 = svg.split("<style>")
                
                if len(svg_parts1) == 1:
                    return svg
                
                if len(svg_parts1) > 2:
                    raise Exception
                
                svg_parts2 = [svg_parts1[0], svg_parts1[1].split("</style>")[1]]
                
                return "".join(svg_parts2)
                    
        except:
            return f"<!-- Invalid file path: {file_path} -->"