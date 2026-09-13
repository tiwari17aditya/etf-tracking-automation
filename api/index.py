"""
Vercel Serverless Entry Point for Stock & Quant Research Station.
Exposes Starlette ASGI app to the Vercel Python Runtime with self-diagnosing error capture.
"""

import sys
import pathlib
import traceback

# Add project root to sys.path
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from core.ui_server import app as real_app
    app = real_app
except Exception as e:
    tb = traceback.format_exc()
    from starlette.applications import Starlette
    from starlette.responses import JSONResponse
    from starlette.routing import Route

    async def crash_handler(request):
        return JSONResponse({
            "error": True,
            "type": "VercelStartupException",
            "exception": str(e),
            "traceback": tb
        }, status_code=200)

    app = Starlette(routes=[
        Route("/{rest:path}", crash_handler)
    ])
