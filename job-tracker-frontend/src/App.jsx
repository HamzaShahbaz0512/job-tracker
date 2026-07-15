import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)

  function login() {
    console.log(email, password)
    fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())

    .then(data => {
      console.log(data)
      if(data.access_token) {
        setToken(data.access_token)
      } else {
        console.log("Error")
        alert(data.error) // shows "Invalid email or password"
      }
    })
  }

  if(token) return (
  <div>
    <h1>Login</h1>
    <input placeholder="Email" onChange={e => setEmail(e.target.value)}/>
    <br/>
    <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)}/>
    <br/>
    <button onClick={login}>Login</button>
    {token && <h3>Logged in successfully ✅</h3>}
  </div>
)

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)}/>
      <br/>
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)}/>
      <br/>
      <button onClick={login}>Login</button>
    </div>
  )
}