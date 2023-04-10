import Lottie from 'react-lottie'
import animationData from './animation.json'
import './Progress.scss'

type Props = {
  progress: number
}

export const Progress: React.FC<Props> = ({progress}) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <div className='progress-container'>
      <Lottie
        options={defaultOptions}
        height={75}
        width={75}
      />
    </div>
  )
}
