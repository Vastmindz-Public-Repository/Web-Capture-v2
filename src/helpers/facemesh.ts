import device from 'current-device'

import {
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_LEFT_IRIS,
  FACEMESH_LIPS,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_TESSELATION,
} from '@mediapipe/face_mesh'

export const faceMeshLandmarkList = [
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_LEFT_IRIS,
  FACEMESH_LIPS,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_TESSELATION,
]

export const faceMeshBaseUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/'

export const faceMeshOptions = {
  maxNumFaces: 1,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
}

export const faceMeshLandmarkOptions = {
  color: '#FFFFFF20',
  lineWidth: 1,
}

const faceSizeThresholds = {
  mobile: 0.4,
  tablet: 0.5,
  desktop: 0.45,
  default: 0.55,
}

export const getFaceSizeThreshold = () => {
  switch (true) {
    case device.mobile():
      return faceSizeThresholds.mobile
    case device.tablet():
      return faceSizeThresholds.tablet
    case device.desktop():
      return faceSizeThresholds.desktop
    default:
      return faceSizeThresholds.default
  }
}

console.log('###', getFaceSizeThreshold())

// Number of landmark points
// https://github.com/rcsmit/python_scripts_rcsmit/blob/master/extras/Gal_Gadot_by_Gage_Skidmore_4_5000x5921_annotated_white_letters.jpg
export const faceTopPointNumber = 10
export const faceBottomPointNumber = 152
