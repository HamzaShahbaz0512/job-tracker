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
  const [jobs ,setJobs] = useState([])


      function get_jobs(){
    fetch('http://127.0.0.1:5000/get_jobs', {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    })
    .then (res=>res.json())
    .then(data =>{
      console.log(data)
      setJobs(data)
    })

  }
  
  function update_job(job_id){
    fetch(`http://127.0.0.1:5000/update_job ${job_id}`, {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    })
    .then (res=>res.json())
    .then(data =>{
      console.log(data)
      setJobs(data)
    })

  }


  function delete_job(job_id){
    fetch(`http://127.0.0.1:5000/delete_job/${job_id}`, {
      method: 'DELETE',
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
    .then (res=>res.json())
    .then(data =>{
      setCompany('')
      setPosition('')
      setDescription('')
    })

  }


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

          <div style={{gap: '10px', display: 'flex', justifyContent:'center', margin:'10px'}}>
            <button onClick={addJob}>Add Job</button>
            <button onClick={get_jobs}>Get Job</button>
          </div>
          {
            jobs.map((Job,index) =>
            (
            <div 
              key={Job.job_id || index }>
              <p>{Job.company} - {Job.description} - {Job.status} - {Job.job_id}</p>
              <dropdown onClick={() => update_job(Job.job_id)}>Update</dropdown>
              <button onClick={() => delete_job(Job.job_id)}>Delete</button>

            </div>
          ))}
          
        </div>
      )}
    </div>
  )
}