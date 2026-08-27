import { Component, type ErrorInfo, type ReactNode } from 'react'
import Icon from '@/core/components/Icon'
import { reportError } from '@/core/monitor'

interface Props {
  children: ReactNode
  scope?: string
  resetKey?: string
  onReset?: () => void
}
interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message }
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: undefined })
    }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    reportError(err, {
      boundary: this.props.scope || 'react',
      componentStack: info.componentStack,
    })
  }

  private retry = () => {
    this.setState({ hasError: false, message: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      const scoped = !!this.props.scope
      return (
        <div className="center-state">
          <div>
            <div style={{ fontSize: 40, marginBottom: 10, color: 'var(--bad)' }}><Icon name="frown" /></div>
            <p style={{ color: 'var(--bad)', fontWeight: 600 }}>
              {scoped ? 'Trang này gặp lỗi.' : 'Đã xảy ra lỗi giao diện.'}
            </p>
            <p className="muted">{this.state.message}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              {scoped && (
                <button className="btn-new" onClick={this.retry}>
                  Thử lại
                </button>
              )}
              <button className="btn-new" onClick={() => location.reload()}>
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
