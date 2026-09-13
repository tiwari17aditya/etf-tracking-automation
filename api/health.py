import os
import sys
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
from mangum import Mangum

async def health(request):
    return JSONResponse({
        "status": "healthy",
        "python_version": sys.version,
        "env_keys": [k for k in os.environ.keys() if not k.startswith("_")]
    })

app = Starlette(routes=[
    Route("/api/health", health),
    Route("/health", health)
])

handler = Mangum(app, lifespan="off")
