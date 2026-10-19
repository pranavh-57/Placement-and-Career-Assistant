import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export const api = {
  health: () => client.get('/health'),

  uploadResume: (file) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  searchJobs: (query, location, limit = 5) =>
    client.post('/jobs/search', { query, location, limit }),

  matchScore: (profile, job) => client.post('/matching/score', { profile, job }),

  skillGap: (profile, job) => client.post('/skills/gap', { profile, job }),

  learningRoadmap: (missing_skills, context = '') =>
    client.post('/learning/roadmap', { missing_skills, context }),

  generateInterview: (role, profile, num_questions = 5) =>
    client.post('/interview/generate', { role, profile, num_questions }),

  evaluateAnswer: (question, answer, role = '') =>
    client.post('/interview/evaluate', { question, answer, role }),

  chat: (message, profile, session_id = 'default') =>
    client.post('/chat', { message, profile, session_id }),

  runWorkflow: (profile, job_query, location = '') =>
    client.post('/workflow/run', { profile, job_query, location }),

  analyzeGithub: (username) => client.post('/github/analyze', { username }),

  ragSearch: (query, k = 4, doc_type = null) =>
    client.post('/rag/search', { query, k, doc_type }),
}

export default api
