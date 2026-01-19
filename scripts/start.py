#!/usr/bin/env python3
import subprocess
import sys
import os
import argparse
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run command and wait for it to complete."""
    print(f"Running: {' '.join(cmd)}")
    is_windows = os.name == "nt"
    process = subprocess.Popen(cmd, cwd=cwd, shell=is_windows)
    try:
        process.wait()
    except KeyboardInterrupt:
        process.terminate()
    return process.returncode

def main():
    parser = argparse.ArgumentParser(description="Start Triple Triad Simulator")
    parser.add_argument("--dev", action="store_true", help="Run in development mode (Vite dev server)")
    args = parser.parse_args()
    
    root_path = Path(__file__).parent.parent
    os.chdir(root_path)

    if args.dev:
        print("=== Starting in DEVELOPMENT mode ===")
        print("Using Vite dev server with hot reload...\n")
        
        # Auto-open browser for dev mode
        import webbrowser
        webbrowser.open("http://localhost:5173")
        
        run_command(["npm", "run", "dev"])
    else:
        print("=== Starting Triple Triad Simulator ===")
        print("Production mode (serving pre-built static files)\n")
        
        # Use Python's built-in HTTP server
        dist_path = root_path / "dist"
        if not dist_path.exists():
            print("Error: Production build not found. Run install.bat first.")
            sys.exit(1)
        
        os.chdir(dist_path)
        print(f"Serving from: {dist_path}")
        print("Open http://localhost:8080 in your browser\n")
        print("Press Ctrl+C to stop\n")
        
        # Auto-open browser for prod mode
        import webbrowser
        webbrowser.open("http://localhost:8080")
        
        try:
            # Use sys.executable to ensure we use the venv's python if activated
            subprocess.run([sys.executable, "-m", "http.server", "8080"])
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()
