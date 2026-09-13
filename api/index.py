"""
Vercel Serverless Entry Point for Stock & Quant Research Station.
Exposes Starlette ASGI app directly to the Vercel Python Runtime.
"""

import sys
import pathlib

# Add project root to sys.path
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from core.ui_server import app

# Explicit top-level exports recognized by Vercel static AST parser
application = app
handler = app
