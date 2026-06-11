'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Link from 'next/link'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.805 10.023H12v3.955h5.286c-.229 1.361-1.029 2.515-2.197 3.32v2.765h3.555c2.084-1.92 3.256-4.745 3.256-8.04 0-.63-.056-1.246-.094-1.255z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.657-4.788 1.325 0 2.466.099 2.797.143v3.24l-1.918.001c-1.504 0-1.795.716-1.795 1.765v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
  </svg>
)

export default function AdminLoginPage(){
  const router = useRouter()

  // Redirect to shared auth page
  useEffect(() => {
    router.replace("/auth?role=admin")
  }, [router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault()
    setIsLoading(true)
    setTimeout(()=>{
      setIsLoading(false)
      router.push('/admin/overview')
    },1000)
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.leaf} aria-hidden>
          <svg viewBox="0 0 100 100" width="80" height="80" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 Q80 40 70 70 Q50 80 30 70 Q20 40 50 10"/></svg>
        </div>
        <div className={styles.leaf} aria-hidden>
          <svg viewBox="0 0 100 100" width="100" height="100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 Q80 40 70 70 Q50 80 30 70 Q20 40 50 10"/></svg>
        </div>
        <div className={styles.leaf} aria-hidden>
          <svg viewBox="0 0 100 100" width="70" height="70" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 Q80 40 70 70 Q50 80 30 70 Q20 40 50 10"/></svg>
        </div>
        <div className={styles.leaf} aria-hidden>
          <svg viewBox="0 0 100 100" width="90" height="90" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 Q80 40 70 70 Q50 80 30 70 Q20 40 50 10"/></svg>
        </div>
        <div className={styles.leaf} aria-hidden>
          <svg viewBox="0 0 100 100" width="75" height="75" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 Q80 40 70 70 Q50 80 30 70 Q20 40 50 10"/></svg>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome back <span aria-hidden>🌱</span></h1>
            <p className={styles.subtitle}>Sign in to continue your eco journey.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="Email address"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
              <label className={styles.checkboxGroup} htmlFor="remember">
                <input id="remember" type="checkbox" className={styles.checkbox} checked={rememberMe} onChange={(e)=>setRememberMe(e.target.checked)} />
                <span className={styles.checkboxLabel}>Remember me</span>
              </label>

              <Link href="#" style={{color:'#2f8b5c',fontWeight:600}}>Forgot password?</Link>
            </div>

            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.signInButton} disabled={isLoading} aria-busy={isLoading}>{isLoading? 'Signing in...':'Sign in'}</button>
              <Link href="#" className={styles.signUpButton}>Sign Up</Link>
            </div>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerText}>Or continue with</div>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.socialButtons}>
            <button type="button" className={styles.socialButton} onClick={()=>console.log('google')}> 
              <span className={styles.socialIcon}><GoogleIcon/></span>
              <span>Google</span>
            </button>
            <button type="button" className={styles.socialButton} onClick={()=>console.log('facebook')}> 
              <span className={styles.socialIcon}><FacebookIcon/></span>
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
