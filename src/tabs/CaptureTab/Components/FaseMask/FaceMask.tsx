import classNames from 'classnames'
import './FaceMask.scss'

type Props = {
  error: boolean
}

export const FaceMask: React.FC<Props> = ({
  error,
}) => {
  return (
    <div className="face-mask-wrapper">
      <div className={classNames({
        'face-mask': true,
        error,
      })}></div>
    </div>
  )
}
