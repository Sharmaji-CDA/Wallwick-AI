import Footer from "../components/layout/Footer"
import Navbar from "../components/layout/Navbar"
import { AuthProvider } from "../contexts/auth/AuthContext"
import AppRoutes from "./AppRoutes"

function App() {

  return (
    <>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
        <Footer />
      </AuthProvider>
    </>
  )
}

export default App
