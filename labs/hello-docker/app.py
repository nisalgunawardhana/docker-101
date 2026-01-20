import datetime
import http.server
import json
import socketserver


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):  # noqa: N802 (match base class signature)
        body = {
            "message": "Hello from Docker 101!",
            "time_utc": datetime.datetime.utcnow().isoformat() + "Z",
            "container": True,
        }
        encoded = json.dumps(body).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


if __name__ == "__main__":
    with socketserver.TCPServer(("", 8000), Handler) as httpd:
        print("Serving on http://0.0.0.0:8000")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Shutting down...")
