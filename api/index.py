"""
Vercel Serverless Entry Point for Stock & Quant Research Station.
Provides a lightweight health & status endpoint for the Vercel deployment.
The quantitative analysis engine runs locally on the user's workstation at http://localhost:8000.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        data = {
            "status": "online",
            "message": "Stock & ETF Quant Research Station is active.",
            "mode": "hybrid",
            "local_engine": "http://localhost:8000",
            "python_version": sys.version.split()[0],
        }
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


app = handler
