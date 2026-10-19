import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function GoogleLoginButton() {
  const buttonRef = useRef(null)
  const { loginWithGoogleToken } = useAuth()

  useEffect(() => {
    if (!window.google || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        await loginWithGoogleToken(response.credential)
      },
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
    })
  }, [loginWithGoogleToken])

  return <div ref={buttonRef} />
}
