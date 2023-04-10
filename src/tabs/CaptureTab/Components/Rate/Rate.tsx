import './Rate.scss'

type Props = {
  value: number
  unit: string
  type: string
  name: string
}

export const Rate: React.FC<Props> = ({value, unit, type, name}) => {
  return (
    <div className="rate-container">
      <div className="rate-container-title">{name}</div>
      <div className="rate-container-value">
        {value > 0 ? (
          <>
            {value}
            <span className="rate-container-value-unit">{unit}</span>
          </>
        ) : (
          <img
            className="warning-image"
            src={require('assets/images/note-icon.svg').default}
            alt="Warning"
          />
        )}
      </div>
      <div className={`rate-container-type ${value > 0 ? type.toLowerCase() : ''}`}>{value > 0 ? type : 'n/a'}</div>
    </div>
  )
}
