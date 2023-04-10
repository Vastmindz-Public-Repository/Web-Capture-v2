import {
  loadingScreenDelay,
  loadingScreenMessages,
} from 'helpers/loadingScreen'
import { useEffect, useState } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useMockProgress } from 'mock-progress-react'
import './LoadingScreen.scss'

type Props = {
  ready: boolean
}

export const LoadingScreen: React.FC<Props> = ({ ready }) => {
  const [step, setStep] = useState(0)
  const { start, finish, progress } = useMockProgress({
    autoComplete: false,
    timeInterval: 1000,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(step =>
        step >= loadingScreenMessages.length - 1 ? 0 : step + 1
      )
    }, loadingScreenDelay)
    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (ready) {
      finish()
    } else {
      start()
    }
  }, [ready, finish, start])

  return (
    <div className="loading-screen-container">
      <div className="progress-bar-container">
        <CircularProgressbar
          value={progress}
          text={`${progress}%`}
          strokeWidth={6} />
      </div>
      <div className="message-wrapper">
        {loadingScreenMessages[step]}
      </div>
    </div>
  )
}
