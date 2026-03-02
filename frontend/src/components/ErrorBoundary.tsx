import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

interface Props {
  children: React.ReactNode
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-destructive">出错了</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message}
          </p>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {error.stack}
          </pre>
          <Button onClick={resetErrorBoundary}>
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error stack:', error.stack);
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
