import React from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import TeacherLogin from './pages/TeacherLogin'
import UserRegistration from './pages/UserRegistration'
import { useEffect } from 'react';
import JoinRoom from './pages/JoinRoom';
import TeacherTopic from './pages/TeacherTopic'
import QuestionGenerator from './pages/QuestionGenerator'
import StudentView from './pages/StudentView'

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<TeacherLogin />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/session/:pin" element={<StudentView />} />
          <Route path="/teacher-topic" element={<TeacherTopic />} />
          <Route path="/question" element={<QuestionGenerator />} />
        </Routes>
      </Router>
  )
}