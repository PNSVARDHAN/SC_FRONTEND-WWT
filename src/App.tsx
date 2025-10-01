import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./components/login/login"
import Home from "./components/maincomponent/Home"
import Profile from "./components/profile/Profile"
import DeviceManager from "./components/devices/DeviceManager"
import VideoUpload from "./components/videos/VideoUpload"
import VideoList from "./components/videos/VideoList"
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

        {/* Login */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/home" replace /> : <Login />}
        />

        {/* Protected routes inside Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />  
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/devices" element={<DeviceManager />} />
          <Route path="/videos">
            <Route path="upload" element={<VideoUpload />} />
            <Route path="list" element={<VideoList />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
