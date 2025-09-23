import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Layout from './pages/Layout.jsx'
import WriteArticle from './pages/WriteArticle.jsx'
import BlogTitles from './pages/BlogTitles'
import GenerateImages from './pages/GenerateImages.jsx'
import RemoveBackground from './pages/RemoveBackground.jsx'
import RemoveObjects from './pages/RemoveObjects.jsx'
import ReviewResume from './pages/ReviewResume.jsx'
import HealthAssistant from './pages/HealthAssistant.jsx'
import StudyAssistant from './pages/StudyAssistant.jsx'
import Community from './pages/Community.jsx'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import {Toaster} from 'react-hot-toast'


const App = () => {
  const {getToken} = useAuth()
  useEffect(()=>{
    getToken().then((token)=>console.log(token))
  }, [])
  
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ai' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='write-article' element={<WriteArticle />} />
          <Route path='blog-titles' element={<BlogTitles />} />
          <Route path='generate-images' element={<GenerateImages />} />
          <Route path='remove-background' element={<RemoveBackground />} />
          <Route path='remove-objects' element={<RemoveObjects />} />
          <Route path='review-resume' element={<ReviewResume />} />
          <Route path='health-assistant' element={<HealthAssistant />} />
          <Route path='study-assistant' element={<StudyAssistant />} />
          <Route path='community' element={<Community />} />
        </Route>
      </Routes>
    </div>
  )
}
export default App;
