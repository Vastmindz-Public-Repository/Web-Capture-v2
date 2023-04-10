import { Loader } from '@fluentui/react-northstar'
import { BrowserRouter, Redirect, Route } from 'react-router-dom'
import { useTeamsFx } from '@microsoft/teamsfx-react'
import { TeamsFxContext } from './Context'
import { TeamsTheme } from '@fluentui/react-teams/lib/cjs/themes'
import { Provider } from '@fluentui/react-teams'

import './App.scss'
import { lazy, Suspense } from 'react'
import CapturePermissions from 'tabs/CaptureTab/Views/Capture/CapturePermissions'

// Lazy loading components
const Capture = lazy(() =>
  import(/* webpackChunkName: "capture" */ 'tabs/CaptureTab/Views/Capture/Capture'))
const ErrorNotification = lazy(() =>
  import(/* webpackChunkName: "error-notification" */ 'tabs/CaptureTab/Views/ErrorNotification/ErrorNotification'))
const BadConditions = lazy(() =>
  import(/* webpackChunkName: "bad-conditions" */ 'tabs/CaptureTab/Views/BadConditions/BadConditions'))

export default function App() {
  const { loading, theme, themeString, teamsfx } = useTeamsFx()

  return (
    <TeamsFxContext.Provider value={{ theme, themeString, teamsfx }}>
      <Provider themeName={TeamsTheme.Dark} lang="en-US">
        <BrowserRouter>
          <Route exact path="/">
            <Redirect to={'/capture'} />
          </Route>
          {loading ? (
            <Loader style={{ margin: 100 }} label={'just a moment...'} />
          ) : (
            <Suspense fallback={<Loader style={{ margin: 100 }} label='just a moment...' />}>
              <Route path="/capture" render={({ match: { url } }) => (
                <>
                  <Route exact path={`${url}/`} component={Capture} />
                  <Route exact path={`${url}/permissions`} component={CapturePermissions} />
                  <Route exact path={`${url}/error`} component={ErrorNotification} />
                  <Route exact path={`${url}/bad-conditions`} component={BadConditions} />
                </>
              )} />
            </Suspense>
          )}
        </BrowserRouter>
      </Provider>
    </TeamsFxContext.Provider>
  )
}
