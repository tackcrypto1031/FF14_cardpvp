#!/usr/bin/env python3
import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, cwd=None):
    print(f"Running: {' '.join(cmd)}")
    try:
        # Use shell=True for npm commands on Windows
        is_windows = os.name == "nt"
        result = subprocess.run(cmd, cwd=cwd, check=True, shell=is_windows)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        return False

def main():
    print("=== Installing Triple Triad Simulator ===\n")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("Error: Python 3.8+ required")
        sys.exit(1)
    
    # Create venv if it doesn't exist
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Creating Python virtual environment...")
        run_command([sys.executable, "-m", "venv", "venv"])
    
    # Install Python dependencies
    print("\nInstalling Python dependencies...")
    pip_path = venv_path / "Scripts" / "pip.exe" if os.name == "nt" else venv_path / "bin" / "pip"
    # Ensure requirements.txt exists
    if not Path("requirements.txt").exists():
        with open("requirements.txt", "w") as f:
            f.write("# Minimal dependencies\n")
            
    run_command([str(pip_path), "install", "-r", "requirements.txt"])
    
    # Install Node dependencies
    print("\nInstalling Node.js dependencies...")
    run_command(["npm", "install"])
    
    # Build production version
    print("\nBuilding production version...")
    run_command(["npm", "run", "build"])
    
    print("\n✓ Installation complete!")
    print("  Run 'start.bat' (Windows) or './start.sh' (Linux/Mac) to start the app")

if __name__ == "__main__":
    main()
