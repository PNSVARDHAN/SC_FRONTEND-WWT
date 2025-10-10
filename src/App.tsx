import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./components/login/login"
import Home from "./components/maincomponent/Home"
import ProtectedRoute from "./components/ProtectedRoute"
import { isAuthenticated } from "./utils/auth"
import Layout from "./components/layout/Layout"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/home" replace /> : <Login />}
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />  
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

