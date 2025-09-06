import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import RBZApplicationForm from './components/RBZApplicationForm'
import ApplicationForm from './components/ApplicationForm'
import DocumentUploadWizard from './components/DocumentUploadWizard'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (check localStorage for token)
    const token = localStorage.getItem('auth_token')
    if (token) {
      // Validate token with backend
      fetch('http://localhost:8000/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUser(data.user)
        } else {
          localStorage.removeItem('auth_token')
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MFI Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Navigation user={user} setUser={setUser} />
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />
          <Route
            path="/application"
            element={user && user.user_type === 'applicant' ? <RBZApplicationForm user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/application-form"
            element={user && user.user_type === 'applicant' ? <ApplicationForm user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/upload"
            element={user && user.user_type === 'applicant' ? <DocumentUploadWizard user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
