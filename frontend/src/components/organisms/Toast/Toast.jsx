import './Toast.scss'

function Toast({ message }) {
  return (
    <div className="toast animate-in" role="status" aria-live="polite">
      {message}
    </div>
  )
}

export default Toast
