

import { useState } from 'react'
import './App.css'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [description ,setDescription] = useState('')
  const [status, setStatus] = useState('Applied')

  function login() {
    fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if(data.access_token) {
        setToken(data.access_token)
      } else {
        alert(data.error)
      }
    })
  }
function addJob() {
  fetch('http://127.0.0.1:5000/create_job', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      job_id: Date.now(),
      company,
      position,
      description,
      status,
      user_id: 1,
      date_applied: new Date().toISOString().split('T')[0]
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data)
    setCompany('')
    setPosition('')
    setDescription('')
    
  })
}  // ONE return statement, decides what to show based on token
  return (
    <div>
      {!token && (
        <div>
          <h1>Login</h1>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)}/>
          <br/>
          <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)}/>
          <br/>
          <button onClick={login}>Login</button>
        </div>
      )}

      {token && (
        <div>
          <h3>Logged in successfully ✅</h3>
          <input placeholder="Company" onChange={e => setCompany(e.target.value)}/>
          <br></br>
          <input placeholder="Position" onChange={e => setPosition(e.target.value)}/>
          <br></br>
          <input placeholder="description" onChange={e => setDescription(e.target.value)}/>
          <br></br>
          <button onClick={addJob}>Add Job</button>
        </div>
      )}
    </div>
  )
}