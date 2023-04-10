import { Button } from '@fluentui/react-northstar'
import { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import './BadConditions.scss'

export function BadConditions() {
  const history = useHistory()
  const location = useLocation()

  const [message, setMessage] = useState<string>()

  useEffect(() => {
    const msg = location.state as string
    if (!msg) {
      history.push('/capture')
      return
    }

    setMessage(msg)
  }, [history, location.state])

  const tryAgainButtonHandler = () => {
    history.push('/capture')
  }

  return (
    <div className="bad-conditions-container">
      <div className="title-error">Error</div>
      <div className="message-container">
        <div className="title">Unable to take readings</div>
        <div className="content">
          {message}
        </div>
      </div>
      <Button onClick={tryAgainButtonHandler} primary content="Try Again" />
    </div>
  )
}

export default BadConditions
