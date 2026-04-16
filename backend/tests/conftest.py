"""
conftest.py — shared pytest fixtures for all test files
"""
import sys, os
# Ensure backend app is importable from any test file
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
