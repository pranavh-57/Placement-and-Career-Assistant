import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import AgentActivityPanel from './components/AgentActivityPanel.jsx'
import Overview from './components/Overview.jsx'
import ResumeUpload from './components/ResumeUpload.jsx'
import JobSearch from './components/JobSearch.jsx'
import MatchScore from './components/MatchScore.jsx'
import LearningRoadmap from './components/LearningRoadmap.jsx'
import InterviewPrep from './components/InterviewPrep.jsx'
import api from './api/client.js'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [toolUsed, setToolUsed] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [match, setMatch] = useState(null)
  const [skillGap, setSkillGap] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [steps, setSteps] = useState([])
  const [error, setError] = useState('')

  const [resumeLoading, setResumeLoading] = useState(false)
  const [jobSearchLoading, setJobSearchLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [workflowLoading, setWorkflowLoading] = useState(false)

  const pushStep = (agent, action, detail = '') =>
    setSteps((s) => [...s, { agent, action, detail }])

  const handleResumeUpload = async (file) => {
    pushStep('Resume Agent', 'Parsing resume PDF', file.name)
    const res = await api.uploadResume(file)
    setProfile(res.data.profile)
    pushStep('Resume Agent', 'Profile extracted', res.data.summary)
  }

  const handleJobSearch = async (query, location) => {
    setJobSearchLoading(true)
    pushStep('Job Search (MCP)', 'Calling search_jobs tool', query)
    try {
      const res = await api.searchJobs(query, location)
      setJobs(res.data.jobs)
      setToolUsed(res.data.tool_used)
      pushStep('Job Search (MCP)', `${res.data.jobs.length} results via ${res.data.tool_used}`)
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
      pushStep('Job Matching Agent', 'Scoring resume against job description', selectedJob.title)
      const matchRes = await api.matchScore(profile, selectedJob)
      setMatch(matchRes.data)
      pushStep('Job Matching Agent', `Match score: ${matchRes.data.match_score}/100`)

      pushStep('Skill Gap Agent', 'Identifying and prioritizing missing skills')
      const gapRes = await api.skillGap(profile, selectedJob)
      setSkillGap(gapRes.data)
      pushStep('Skill Gap Agent', `${gapRes.data.missing_skills.length} gaps identified`)
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
      pushStep('Learning Recommendation Agent', 'Retrieving learning resources (RAG)', skillGap.priority_order.join(', '))
      const res = await api.learningRoadmap(skillGap.priority_order)
      setRoadmap(res.data)
      pushStep('Learning Recommendation Agent', `Roadmap built: ~${res.data.total_estimated_weeks} weeks`)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Roadmap generation failed.')
    } finally {
      setRoadmapLoading(false)
    }
  }

  const generateInterview = async (role) => {
    setInterviewLoading(true)
    try {
      pushStep('Interview Agent', 'Generating role-specific questions (RAG)', role)
      const res = await api.generateInterview(role, profile)
      setInterviewQuestions(res.data.questions)
      pushStep('Interview Agent', `${res.data.questions.length} questions generated`)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Question generation failed.')
    } finally {
      setInterviewLoading(false)
    }
  }

  const evaluateAnswer = async (question, answer) => {
    pushStep('Interview Agent', 'Evaluating candidate answer', question.slice(0, 60) + '…')
    const res = await api.evaluateAnswer(question, answer, selectedJob?.title || '')
    pushStep('Interview Agent', `Score: ${res.data.score}/10`)
    return res.data
  }

  const runFullWorkflow = async (jobQuery) => {
    if (!profile) return
    setWorkflowLoading(true)
    try {
      const res = await api.runWorkflow(profile, jobQuery)
      const data = res.data
      setSteps((s) => [...s, ...data.steps])
      if (data.job) { setSelectedJob(data.job); setJobs([data.job]) }
      if (data.match) setMatch(data.match)
      if (data.skill_gap) setSkillGap(data.skill_gap)
      if (data.roadmap) setRoadmap(data.roadmap)
      if (data.interview_questions) setInterviewQuestions(data.interview_questions)
      setActiveTab('match')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Workflow failed.')
    } finally {
      setWorkflowLoading(false)
    }
  }

  const handleChat = async (message) => {
    const res = await api.chat(message, profile)
    setSteps((s) => [...s, ...res.data.steps])
    return res.data.reply
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={activeTab} onChange={setActiveTab} />

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
              onRunWorkflow={runFullWorkflow}
              workflowLoading={workflowLoading}
              onChat={handleChat}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeUpload
              profile={profile}
              onUploaded={handleResumeUpload}
              onError={setError}
              loading={resumeLoading}
              setLoading={setResumeLoading}
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
              onEvaluate={evaluateAnswer}
              defaultRole={selectedJob?.title}
            />
          )}
        </div>
      </main>

      <AgentActivityPanel steps={steps} running={resumeLoading || jobSearchLoading || matchLoading || roadmapLoading || interviewLoading || workflowLoading} />
    </div>
  )
}
