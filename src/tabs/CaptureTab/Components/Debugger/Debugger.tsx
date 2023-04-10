import { Fps } from 'helpers/rppg'
import {
  ImageQualityFlags,
} from 'rppg/dist/lib/RPPGTracker.types'
import './Debugger.scss'

type Props = {
  imageQualityFlags: ImageQualityFlags
  fps: Fps
  faceDetected: boolean
  faceSizeStatus: boolean
  processing: boolean
  loading: boolean
  ready: boolean
  progressType: string
  finished: boolean
  conditions: Record<string, unknown>
  conditionsOk: boolean
}

export const Debugger: React.FC<Props> = ({
  imageQualityFlags,
  fps,
  faceDetected,
  faceSizeStatus,
  processing,
  loading,
  ready,
  progressType,
  finished,
  conditions,
  conditionsOk,
}) => {
  return (
    <div className="debug-container">
      <b className="title">Debug mode enabled</b>
      <p className="title">Light flags:</p>

      <p className="key">
        brightColorFlag:
        <span className={`value ${imageQualityFlags.brightColorFlag}`}>
          {String(imageQualityFlags.brightColorFlag)}
        </span>
      </p>

      <p className="key">
        sharpFlag:
        <span className={`value ${imageQualityFlags.sharpFlag}`}>
          {String(imageQualityFlags.sharpFlag)}
        </span>
      </p>

      <p className="key">
        noiseFlag:
        <span className={`value ${imageQualityFlags.noiseFlag}`}>
          {String(imageQualityFlags.noiseFlag)}
        </span>
      </p>

      <p className="key">
        illumChangeFlag:
        <span className={`value ${imageQualityFlags.illumChangeFlag}`}>
          {String(imageQualityFlags.illumChangeFlag)}
        </span>
      </p>

      <p className="title">Face flags:</p>

      {/* <p className="key">
        faceSizeFlag:
        <span className={`value ${imageQualityFlags.faceSizeFlag}`}>
          {String(imageQualityFlags.faceSizeFlag)}
        </span>
      </p> */}

      <p className="key">
        faceOrientFlag:
        <span className={`value ${imageQualityFlags.faceOrientFlag}`}>
          {String(imageQualityFlags.faceOrientFlag)}
        </span>
      </p>

      <p className="title">FaceMesh flags:</p>
      <p className="key">
        faceDetected:
        <span className={`value ${faceDetected}`}>
          {String(faceDetected)}
        </span>
      </p>

      <p className="key">
        faceSizeStatus:
        <span className={`value ${faceSizeStatus}`}>
          {String(faceSizeStatus)}
        </span>
      </p>

      <p className="title">FPS:</p>
      <p className="key">
        averageFps:
        <span className="value">
          {fps.averageFps}
        </span>
      </p>

      <p className="key">
        maxFps:
        <span className="value">
          {fps.maxFps}
        </span>
      </p>

      <p className="key">
        unsupported:
        <span className={`value ${!fps.unsupported}`}>
          {String(fps.unsupported)}
        </span>
      </p>

      <p className="title">Other flags:</p>
      <p className="key">
        processing:
        <span className={`value ${processing}`}>
          {String(processing)}
        </span>
      </p>

      <p className="key">
        loading:
        <span className={`value ${!loading}`}>
          {String(loading)}
        </span>
      </p>

      <p className="key">
        ready:
        <span className={`value ${ready}`}>
          {String(ready)}
        </span>
      </p>

      <p className="key">
        progressType:
        <span className={`value ${progressType}`}>
          {progressType}
        </span>
      </p>

      <p className="key">
        finished:
        <span className={`value ${finished}`}>
          {String(finished)}
        </span>
      </p>

      <p className="title">Conditions:</p>
      <p className="key">
        face:
        <span className={`value ${conditions.face}`}>
          {String(conditions.face)}
        </span>
      </p>
      <p className="key">
        faceSize:
        <span className={`value ${conditions.faceSize}`}>
          {String(conditions.faceSize)}
        </span>
      </p>
      <p className="key">
        faceOrient:
        <span className={`value ${conditions.faceOrient}`}>
          {String(conditions.faceOrient)}
        </span>
      </p>
      <p className="key">
        light:
        <span className={`value ${conditions.light}`}>
          {String(conditions.light)}
        </span>
      </p>
      <p className="key">
        conditionsOk:
        <span className={`value ${conditionsOk}`}>
          {String(conditionsOk)}
        </span>
      </p>

    </div>
  )
}
