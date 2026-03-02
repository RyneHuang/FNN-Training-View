"""FastAPI dependencies for dependency injection."""
from fastapi import Depends, Request


def get_session_id(request: Request) -> str:
    """
    获取当前请求的 session_id
    
    由 SessionMiddleware 设置并存储在 request.state 中
    """
    return request.state.session_id
