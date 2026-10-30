import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/api/auth/me', { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const loginWithGoogleToken = async (googleIdToken) => {
    const res = await axios.post(
      '/api/auth/google',
      { id_token: googleIdToken },
      { withCredentials: true },
    )
    setUser(res.data.user)
  }

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true }).catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogleToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
