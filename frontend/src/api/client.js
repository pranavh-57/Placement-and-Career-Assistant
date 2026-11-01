import axios from 'axios'

const SLOW_MS = 4000

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 90000,
})

// Tell the UI when any request has been pending for a while (cold start banner).
let slowCount = 0
const notifySlow = () =>
  window.dispatchEvent(new CustomEvent('wayfind:slow', { detail: slowCount > 0 }))

const settle = (config) => {
  if (!config) return
  clearTimeout(config._slowTimer)
  if (config._isSlow) {
    config._isSlow = false
    slowCount -= 1
    notifySlow()
  }
}

client.interceptors.request.use((config) => {
  config._slowTimer = setTimeout(() => {
    config._isSlow = true
    slowCount += 1
    notifySlow()
  }, SLOW_MS)
  return config
})

client.interceptors.response.use(
  (res) => {
    settle(res.config)
    return res
  },
  (err) => {
    settle(err.config)
    if (err.response?.status === 401) window.location.reload()
    return Promise.reject(err)
  },
)

export const api = {
  health: () => client.get('/health'),
  history: () => client.get('/history'),
  saveHistory: (snapshot) => client.post('/history/snapshot', snapshot),

  getProfile: () => client.get('/profile'),
  saveProfile: (profile) => client.put('/profile', profile),
  deleteMyData: () => client.delete('/me/data'),

  uploadResume: (file) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  searchJobs: (query, location, limit = 5, job_type = 'any') =>
    client.post('/jobs/search', { query, location, limit, job_type }),

  savedJobs: () => client.get('/saved-jobs'),

  saveJob: (job, status = 'saved') => client.post('/saved-jobs', { job, status }),

  updateSavedJob: (id, patch) => client.patch(`/saved-jobs/${id}`, patch),

  removeSavedJob: (id) => client.delete(`/saved-jobs/${id}`),

  campusDrives: (params) => client.get('/campus/drives', { params }),

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

  ragSearch: (query, k = 4, doc_type = null) => client.post('/rag/search', { query, k, doc_type }),
}

export default api
