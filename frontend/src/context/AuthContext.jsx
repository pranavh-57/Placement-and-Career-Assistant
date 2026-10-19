import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios
      .get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => { setToken(null); localStorage.removeItem('access_token') })
      .finally(() => setLoading(false))
  }, [token])

  const loginWithGoogleToken = async (googleIdToken) => {
    const res = await axios.post('/api/auth/google', { id_token: googleIdToken })
    localStorage.setItem('access_token', res.data.access_token)
    setToken(res.data.access_token)
    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, loginWithGoogleToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
