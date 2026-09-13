"""
Vercel Serverless Entry Point for Stock & Quant Research Station.
Provides a lightweight health & status endpoint for the Vercel deployment.
The heavy quantitative analysis engine runs locally on http://localhost:8000.
"""

import json
import sys


def app(scope_or_environ, receive_or_start_response=None, send=None):
    """
    Universal WSGI & ASGI entrypoint callable for Vercel Serverless runtime.
    Requires zero external dependencies and starts instantaneously.
    """
    data = {
        "status": "online",
        "message": "Stock & ETF Quant Research Station is active.",
        "mode": "hybrid",
        "local_engine": "http://localhost:8000",
        "python_version": sys.version.split()[0],
    }
    body = json.dumps(data).encode("utf-8")

    # ASGI mode (3 arguments: scope, receive, send)
    if send is not None:
        async def asgi_app():
            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": [
                    [b"content-type", b"application/json"],
                    [b"access-control-allow-origin", b"*"],
                    [b"access-control-allow-methods", b"GET, OPTIONS"],
                    [b"access-control-allow-headers", b"Content-Type"],
                ],
            })
            await send({
                "type": "http.response.body",
                "body": body,
            })
        return asgi_app()

    # WSGI mode (2 arguments: environ, start_response)
    environ = scope_or_environ
    start_response = receive_or_start_response
    start_response("200 OK", [
        ("Content-Type", "application/json"),
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type"),
    ])
    return [body]


handler = app
