import './CapturePermissions.scss'

/* eslint-disable max-len */
export function CapturePermissions() {

  return (
    <div
      id="popup-modal"
      className="fixed top-0 left-0 bottom-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full">
      <div className="absolute right-3 w-full h-full max-w-md md:h-auto">
        <div className="w-0 h-0 border-8 border-solid border-transparent border-b-white right-2 absolute -top-4"></div>
        <img className="absolute right-3 top-3 arrow" src={require('assets/images/arrow.svg').default} alt="arrow" />
        <div className="absolute bg-white rounded-lg shadow">
          <div className="p-6 text-center text-gray-700">
            <svg aria-hidden="true" className="mx-auto mb-4 text-sky-800 w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 className="mb-5 text-lg font-normal text-sky-800">Enable camera access</h3>
            <div>For the full Visix experience, we need to enable camera permissions within Teams</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CapturePermissions
