import './Status.scss'

type Props = {
  min?: number
  max?: number
  value?: number
}

const width = 104
const circleWidth = 24

export const Status: React.FC<Props> = ({min = 0, max = 0, value = 0}) => {

  const getStyle = () => {
    const zoom = width / (max - min)
    let left = zoom * (value - min) - circleWidth / 2
    if (left < 0) {
      left = 0
    }
    if (left > width) {
      left = width
    }
    return {
      left: left + 'px',
    }
  }

  return (
    <div className="status-container">
      <div className="status-wrapper">
        <div className="status-circle" style={getStyle()}>

        </div>
      </div>
    </div>
  )
}
