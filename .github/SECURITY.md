# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
|---------|--------------------|
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue.

Instead, send an email to: hhsky0618@gmail.com

Please include:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if known)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Investigation**: Within 1 week
- **Patch Release**: Based on severity

### Severity Levels

| Level | Response Time |
|-------|---------------|
| Critical | 48 hours |
| High | 1 week |
| Medium | Next release |
| Low | Next release |

## Security Best Practices

### Deployment
- Use HTTPS in production (set `secure=True` in session cookie)
- Keep dependencies updated
- Use environment variables for sensitive config
- Enable CORS only for trusted origins
- Use a WAF (Web Application Firewall) in production

### Session Security
- Session IDs are generated using `secrets.token_urlsafe(32)` (cryptographically secure)
- Cookies are HTTP-Only to prevent XSS attacks
- SameSite=Lax for CSRF protection
- Sessions expire after 7 days

### Data Handling
- No user data is permanently stored
- Training data is ephemeral (cleared after session ends)
- No passwords or authentication credentials
- All models are stored in-memory only

## Known Security Considerations

### Session Hijacking
- **Mitigation**: HTTP-Only cookies, secure flag in production
- **Recommendation**: Use HTTPS in production

### Resource Exhaustion
- **Risk**: Users could train many large models simultaneously
- **Mitigation**: Implement rate limiting (future enhancement)
- **Current**: Memory limits per session

### Code Injection
- **Risk**: User can configure any network architecture
- **Mitigation**: Input validation on all parameters
- **Current**: TensorFlow sandbox provides some protection

---

Thank you for helping keep FNN Training View secure!
