import { useState, useRef } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage from './components/LoginPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import Overview from './components/Overview.jsx'
import JobSearch from './components/JobSearch.jsx'
import MatchScore from './components/MatchScore.jsx'
import LearningRoadmap from './components/LearningRoadmap.jsx'
import InterviewPrep from './components/InterviewPrep.jsx'
import api from './api/client.js'

export default function App() {
  // All hooks MUST run on every render, in the same order — so they come
  // before any early return (auth loading / logged-out) below.
  const { user, loading: authLoading, logout } = useAuth()

  const sessionIdRef = useRef(
    sessionStorage.getItem('chat_session_id') ||
      (() => {
        const id = crypto.randomUUID()
        sessionStorage.setItem('chat_session_id', id)
        return id
      })()
  )

  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [toolUsed, setToolUsed] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [match, setMatch] = useState(null)
  const [skillGap, setSkillGap] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [error, setError] = useState('')

  const [resumeLoading, setResumeLoading] = useState(false)
  const [jobSearchLoading, setJobSearchLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [workflowLoading, setWorkflowLoading] = useState(false)

  // Now safe to branch — every hook above has already run unconditionally.
  if (authLoading) return null
  if (!user) return <LoginPage />

  const handleResumeUpload = async (file) => {
    const res = await api.uploadResume(file)
    setProfile(res.data.profile)
  }

  const handleJobSearch = async (query, location) => {
    setJobSearchLoading(true)
    try {
      const res = await api.searchJobs(query, location)
      setJobs(res.data.jobs)
      setToolUsed(res.data.tool_used)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Job search failed.')
    } finally {
      setJobSearchLoading(false)
    }
  }

  const handleSelectJob = (job) => {
    setSelectedJob(job)
    setMatch(null)
    setSkillGap(null)
    setRoadmap(null)
    setActiveTab('match')
  }

  const runMatchAndGap = async () => {
    if (!profile || !selectedJob) return
    setMatchLoading(true)
    try {
      const matchRes = await api.matchScore(profile, selectedJob)
      setMatch(matchRes.data)
      const gapRes = await api.skillGap(profile, selectedJob)
      setSkillGap(gapRes.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Analysis failed.')
    } finally {
      setMatchLoading(false)
    }
  }

  const generateRoadmap = async () => {
    if (!skillGap) return
    setRoadmapLoading(true)
    try {
      const res = await api.learningRoadmap(skillGap.priority_order)
      setRoadmap(res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Roadmap generation failed.')
    } finally {
      setRoadmapLoading(false)
    }
  }

  const generateInterview = async (role) => {
    setInterviewLoading(true)
    try {
      const res = await api.generateInterview(role, profile)
      setInterviewQuestions(res.data.questions)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Question generation failed.')
    } finally {
      setInterviewLoading(false)
    }
  }

  const runFullWorkflow = async (jobQuery) => {
    if (!profile) return
    setWorkflowLoading(true)
    setError('')
    try {
      const res = await api.runWorkflow(profile, jobQuery)
      const data = res.data
      if (data.job) { setSelectedJob(data.job); setJobs([data.job]) }
      if (data.match) setMatch(data.match)
      if (data.skill_gap) setSkillGap(data.skill_gap)
      if (data.roadmap) setRoadmap(data.roadmap)
      if (data.interview_questions) setInterviewQuestions(data.interview_questions)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Workflow failed.')
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleChat = async (message) => {
    const res = await api.chat(message, profile, sessionIdRef.current)
    return res.data.reply
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={activeTab} onChange={setActiveTab} user={user} onLogout={logout} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-md bg-signal-red/10 border border-signal-red/20 text-signal-red text-sm">
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <Overview
              profile={profile}
              onResumeUploaded={handleResumeUpload}
              onResumeError={setError}
              resumeLoading={resumeLoading}
              setResumeLoading={setResumeLoading}
              match={match}
              skillGap={skillGap}
              roadmap={roadmap}
              interviewQuestions={interviewQuestions}
              onChat={handleChat}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'jobs' && (
            <JobSearch
              onSearch={handleJobSearch}
              jobs={jobs}
              toolUsed={toolUsed}
              onSelectJob={handleSelectJob}
              selectedJobId={selectedJob?.id}
              loading={jobSearchLoading}
            />
          )}

          {activeTab === 'match' && (
            <MatchScore
              job={selectedJob}
              match={match}
              skillGap={skillGap}
              loading={matchLoading}
              onAnalyze={runMatchAndGap}
            />
          )}

          {activeTab === 'learning' && (
            <LearningRoadmap
              skillGap={skillGap}
              roadmap={roadmap}
              loading={roadmapLoading}
              onGenerate={generateRoadmap}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewPrep
              questions={interviewQuestions}
              loading={interviewLoading}
              onGenerate={generateInterview}
              defaultRole={selectedJob?.title}
            />
          )}
        </div>
      </main>
    </div>
  )
}
