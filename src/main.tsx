import ReactDOM from 'react-dom/client'
import App from './App'
import GlobalLoader from './components/GlobalLoader'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
    <GlobalLoader />
  </AuthProvider>,
)
