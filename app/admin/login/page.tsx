'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Link from 'next/link'

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
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
