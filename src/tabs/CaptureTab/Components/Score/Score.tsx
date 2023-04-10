import { useEffect, useState } from 'react'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { TeachingBubble } from '@fluentui/react/lib/TeachingBubble'
import { useId } from '@fluentui/react-hooks'
import 'react-circular-progressbar/dist/styles.css'
import './Score.scss'
import { DirectionalHint } from '@fluentui/react'

type Props = {
  score: number
}

// todo move to global consts
export const welnessScore = [{
  min: -1,
  max: 0,
  definition: 'Insufficient data',
  type: 'undetermined',
  text: 'Come back tomorrow after collecting additional data to unlock your daily readiness guidance!',
}, {
  min: 1,
  max: 3,
  definition: 'Low',
  type: 'low',
  text: 'Prioritize recovery-promoting activities today. Avoid pushing your physical or mental limits if possible.',
}, {
  min: 4,
  max: 6,
  definition: 'Medium',
  type: 'medium',
  text: `Consider reducing stressful activities today. If you decide to push harder, 
    then stay extra aware of recovery needs for the next few days.`,
}, {
  min: 7,
  max: 10,
  definition: 'Optimal',
  type: 'optimal',
  text: 'Nice! Your wellness score is optimal and you should be able to handle more stress and activity today!',
}]

export const Score: React.FC<Props> = ({score}) => {
  const [welnessScoreObject, setText] = useState(welnessScore[0])
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const targetId = useId('target')

  useEffect(() => {
    const result = welnessScore.find(({min, max}) => score >= min && score <= max)
    setText(result || welnessScore[0])
  }, [score])

  return (
    <div
      className="score-container"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}>
      {isTooltipVisible &&
          <TeachingBubble
            calloutProps={{ directionalHint: DirectionalHint.bottomCenter }}
            target={`#${targetId}`}
            isWide={true}
          >
            <p>Your Wellness Score is a personalized daily score that quantifies your ability (readiness) to
                handle the day's challenges based on your body's cumulative stress load and recovery status.</p>
            <p>This 1-10 score uses key physiological metrics to learn your personal patterns and quantify how your
                body is adapting to things like exercise, stress, nutrition, work, and more. It helps you understand
                when your body is ready to perform and when you need to focus on rest and recovery.</p>
            <ul>
              <li>7-10: Optimal, you are ready to handle more challenges today!</li>
              <li>4-6: Not ideal, consider reducing stressful activities today.</li>
              <li>1-3: You are not fully recovered. Prioritize recovery-promoting activities.</li>
            </ul>
          </TeachingBubble>
      }
      <div className="score-title">Wellness Score</div>
      <div className={`score-progress ${welnessScoreObject.type}`} id={targetId}>
        <CircularProgressbarWithChildren value={score} minValue={0} maxValue={10}>
          <div className="score-progress-value-container">
            {score > 0 && (
              <div className="score-progress-value">{score}</div>
            )}
            <div className="score-progress-type">{welnessScoreObject.definition}</div>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <div className="score-footer">
        {welnessScoreObject.text}
      </div>
    </div>
  )
}
