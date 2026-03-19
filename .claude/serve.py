import http.server
import os

os.chdir("/Volumes/SSD 2026/000 Claude/Visual World Workbook")

handler = http.server.SimpleHTTPRequestHandler
httpd = http.server.HTTPServer(("", 8083), handler)
httpd.serve_forever()
