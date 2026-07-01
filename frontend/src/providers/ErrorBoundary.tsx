import { Component, type ErrorInfo, type ReactNode } from 'react'
import Icon from '@/core/components/Icon'
import { reportError } from '@/core/monitor'

interface Props {
  children: ReactNode
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

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('Lỗi giao diện:', err, info)
    reportError(err, { boundary: 'react', componentStack: info.componentStack })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="center-state">
          <div>
            <div style={{ fontSize: 40, marginBottom: 10, color: 'var(--bad)' }}><Icon name="frown" /></div>
            <p style={{ color: 'var(--bad)', fontWeight: 600 }}>Đã xảy ra lỗi giao diện.</p>
            <p className="muted">{this.state.message}</p>
            <button className="btn-new" style={{ marginTop: 12 }} onClick={() => location.reload()}>
              Tải lại trang
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
