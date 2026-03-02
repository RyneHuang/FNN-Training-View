"""Session middleware for multi-user isolation."""
import secrets
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


def generate_session_id() -> str:
    """生成加密安全的 session ID"""
    return f"sess_{secrets.token_urlsafe(32)}"


class SessionMiddleware(BaseHTTPMiddleware):
    """
    Session 中间件
    
    功能：
    1. 检查请求中的 session_id cookie
    2. 如果没有，生成新的 session_id
    3. 将 session_id 存储到 request.state
    4. 在响应中设置 session_id cookie
    """
    
    async def dispatch(self, request: Request, call_next):
        # 检查 cookie 中的 session_id
        session_id = request.cookies.get('session_id')
        
        # 如果没有，生成新的
        if not session_id:
            session_id = generate_session_id()
        
        # 存储到 request.state 供后续使用
        request.state.session_id = session_id
        
        # 调用下一个中间件/路由
        response = await call_next(request)
        
        # 如果请求中没有 session_id cookie，设置新的
        if not request.cookies.get('session_id'):
            response.set_cookie(
                key='session_id',
                value=session_id,
                httponly=True,        # 防止 XSS 攻击
                secure=False,          # 开发环境用 False，生产环境用 True
                samesite='lax',        # CSRF 保护
                max_age=86400 * 7      # 7 天过期
            )
        
        return response
