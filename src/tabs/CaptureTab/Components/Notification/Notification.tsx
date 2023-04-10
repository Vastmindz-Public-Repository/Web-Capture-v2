import { FadeIn } from 'react-slide-fade-in'
import './Notification.scss'

type Props = {
  message: string
}

export const Notification: React.FC<Props> = ({message}) => {
  return (
    <div className="notification-wrapper">
      <FadeIn
        from="top"
        positionOffset={200}
        triggerOffset={400}
      >
        <div className="notification-container">
          <div className="notification">
            {message}
          </div>
        </div>
      </FadeIn>
      {/* <div className="notification-type">
        <p className="notification-type-text">Warning</p>
      </div> */}
    </div>
  )
}
