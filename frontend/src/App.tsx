import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UnifiedTraining from './pages/UnifiedTraining'
import SimpleTest from './pages/SimpleTest'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/training" element={<UnifiedTraining />} />
          <Route path="/test" element={<SimpleTest />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
