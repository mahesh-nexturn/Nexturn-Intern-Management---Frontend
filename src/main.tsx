import ReactDOM from 'react-dom/client'
import App from './App'
import GlobalLoader from './components/GlobalLoader'
import { AuthProvider } from './context/AuthContext'
import { DialogProvider } from './context/DialogProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <DialogProvider>
      <App />
      <GlobalLoader />
    </DialogProvider>
  </AuthProvider>,
)
