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
  const [stats, setStats] = useState(null)

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
      date_applied: new Date().toISOString().split('T')[0]
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("data: ", data)
    setCompany('')
    setPosition('')
    setDescription('')
  })
}
function getMyJobs() {
  fetch(`http://127.0.0.1:5000/myJobs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setJobs(data))
  setJobs(data)
}

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
  
  function update_job(job_id,newStatus){
    fetch(`http://127.0.0.1:5000/update_job/${job_id}`, {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: newStatus })
    })

    .then (res=>res.json())
    .then(data =>{
      console.log(data)
      get_jobs()
      get_stats()
    })

  }

function get_stats() {
  fetch('http://127.0.0.1:5000/job_stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setStats(data))
}

  function delete_job(job_id){
    fetch(`http://127.0.0.1:5000/delete_job/${job_id}`, {
      method: 'DELETE',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },

    })
    .then (res=>res.json())
    .then(data =>{
      console.log(data)
      get_jobs()
    })

  }


// ONE return statement, decides what to show based on token
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
          <input placeholder="Company" value ={company}onChange={e => setCompany(e.target.value)}/>
          <br></br>
          <input placeholder="Position" value={position} onChange={e => setPosition(e.target.value)}/>
          <br></br>
          <input placeholder="description" value={description} onChange={e => setDescription(e.target.value)}/>
          <br></br>

          <div style={{gap: '10px', display: 'flex', justifyContent:'center', margin:'10px'}}>
            <button onClick={addJob}>Add Job</button>
            <button onClick={get_jobs}>Get Job</button>
            <button onClick={getMyJobs}>Get My Jobs</button>
          </div>
          {
            jobs.map((Job,index) =>
            (
            <div 
              key={Job.job_id || index }>
              <p>{Job.company} - {Job.description} - {Job.status} - {Job.job_id}</p>
              <div style ={{gap: '10px', display: 'flex', justifyContent:'center', margin:'10px'}}>
                <button onClick={() => delete_job(Job.job_id)}>Delete</button>

                <select onChange={(e) => update_job(Job.job_id, e.target.value)} value={Job.status}>
                  <option value="Applied">Applied</option>
                  <option value="In progress">Interview in progress</option>
                  <option value="Offer received">Offer received</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
          <button onClick={get_stats}>Load Stats</button>
          {
            stats && (
            <div>
              <p>Total: {stats.total_jobs}</p>
              <p>Applied: {stats.applied_jobs}</p>
              <p>Interview: {stats.interview_jobs}</p>
              <p>Offer: {stats.offer_job}</p>
            </div>
)}
          
        </div>
      )}
    </div>
  )
}