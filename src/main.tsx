import { Provider } from 'react-redux'
import ReactDOM from 'react-dom/client'
import App from './App'
import GlobalLoader from './components/GlobalLoader'
import { AuthProvider } from './context/AuthContext'
import { DialogProvider } from './context/DialogProvider'
import { store } from './store'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <AuthProvider>
      <DialogProvider>
        <App />
        <GlobalLoader />
      </DialogProvider>
    </AuthProvider>
  </Provider>,
)
