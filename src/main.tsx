import React, { Suspense, lazy, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// The owner cockpit lives at #owner and loads on its own, so the customer site never ships its code.
const OwnerCockpit = lazy(() => import('./owner/OwnerCockpit'))
const isOwner = () => window.location.hash.startsWith('#owner')

function Root() {
  const [owner, setOwner] = useState(isOwner)
  useEffect(() => {
    const onHash = () => setOwner(isOwner())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return owner ? <Suspense fallback={null}><OwnerCockpit /></Suspense> : <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
