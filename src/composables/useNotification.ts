import { Notify } from "quasar"

export function useNotification() {
  const success = (msg: string, duration = 3000) => {
    Notify.create({
      message: msg,
      icon: 'done',
      color: 'green',
      timeout: duration,
    })
  }

  const warning = (msg: string, duration = 4000) => {
    Notify.create({
      message: msg,
      icon: 'warning',
      color: 'warning',
      timeout: duration,
    })
  }

  const error = (msg: string, duration = 5000) => {
    Notify.create({
      message: msg,
      icon: 'error',
      color: 'red',
      timeout: duration,
    })
  }

  const info = (msg: string, duration = 5000) => {
    Notify.create({
      message: msg,
      icon: 'info',
      color: 'info',
      timeout: duration,
    })
  }

  return {
    success,
    warning,
    error,
    info
  }
}
