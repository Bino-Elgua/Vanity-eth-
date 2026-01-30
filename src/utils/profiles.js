/**
 * Batch & Profile Mode
 * Save presets, run batch searches, queue results
 * 100% localStorage, no server
 * 
 * @typedef {Object} Profile
 * @property {string} id - Unique identifier
 * @property {string} name - Profile name
 * @property {string} chain - Blockchain ID
 * @property {string} prefix - Address prefix pattern
 * @property {string} suffix - Address suffix pattern
 * @property {boolean} caseSensitive - Case matching flag
 * @property {number} created - Creation timestamp
 * @property {number} lastUsed - Last usage timestamp
 * 
 * @typedef {Object} BatchJob
 * @property {string} id - Job ID
 * @property {Profile[]} profiles - Profiles to run
 * @property {'pending'|'running'|'completed'|'failed'} status - Job status
 * @property {any[]} results - Found addresses
 * @property {number} startTime - Job start time
 * @property {number} [endTime] - Job end time
 * @property {string} [error] - Error message if failed
 */

const STORAGE_KEY = 'vanity-profiles'
const BATCH_QUEUE_KEY = 'vanity-batch-queue'

export function createProfile(name, chain, prefix = '', suffix = '', caseSensitive = false) {
  const profile = {
    id: generateId(),
    name,
    chain,
    prefix,
    suffix,
    caseSensitive,
    created: Date.now(),
    lastUsed: Date.now(),
  }
  
  const profiles = getAllProfiles()
  profiles.push(profile)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  
  return profile
}

export function updateProfile(id, updates) {
  const profiles = getAllProfiles()
  const index = profiles.findIndex(p => p.id === id)
  
  if (index === -1) throw new Error('Profile not found')
  
  profiles[index] = {
    ...profiles[index],
    ...updates,
    lastUsed: Date.now(),
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  return profiles[index]
}

export function deleteProfile(id) {
  const profiles = getAllProfiles()
  const filtered = profiles.filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function getAllProfiles() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getProfile(id) {
  return getAllProfiles().find(p => p.id === id)
}

export function createBatchJob(profiles) {
  /**
   * Queue multiple profiles for batch processing
   */
  
  const job = {
    id: generateId(),
    profiles,
    results: [],
    status: 'pending',
    startTime: Date.now(),
    endTime: null,
  }
  
  const queue = getBatchQueue()
  queue.push(job)
  localStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify(queue))
  
  return job
}

export function updateBatchJob(id, updates) {
  const queue = getBatchQueue()
  const index = queue.findIndex(j => j.id === id)
  
  if (index === -1) throw new Error('Job not found')
  
  queue[index] = {
    ...queue[index],
    ...updates,
  }
  
  localStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify(queue))
  return queue[index]
}

export function addBatchResult(jobId, result) {
  const queue = getBatchQueue()
  const job = queue.find(j => j.id === jobId)
  
  if (!job) throw new Error('Job not found')
  
  job.results.push(result)
  localStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify(queue))
  return job
}

export function getBatchQueue() {
  const stored = localStorage.getItem(BATCH_QUEUE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getBatchJob(id) {
  return getBatchQueue().find(j => j.id === id)
}

export function clearBatchQueue() {
  localStorage.removeItem(BATCH_QUEUE_KEY)
}

export function getProfileStats() {
  /**
   * Statistics about profile usage
   */
  
  const profiles = getAllProfiles()
  const queue = getBatchQueue()
  
  return {
    totalProfiles: profiles.length,
    chainBreakdown: profiles.reduce((acc, p) => {
      acc[p.chain] = (acc[p.chain] || 0) + 1
      return acc
    }, {}),
    batchJobsTotal: queue.length,
    batchJobsCompleted: queue.filter(j => j.status === 'completed').length,
    totalResultsFound: queue.reduce((sum, j) => sum + j.results.length, 0),
  }
}

export function exportProfiles() {
  /**
   * Export all profiles as JSON
   * User can save and restore
   */
  
  const profiles = getAllProfiles()
  return JSON.stringify(profiles, null, 2)
}

export function importProfiles(jsonString) {
  /**
   * Import profiles from JSON
   * Validates format before importing
   */
  
  try {
    const profiles = JSON.parse(jsonString)
    if (!Array.isArray(profiles)) throw new Error('Invalid format')
    
    // Validate each profile
    for (const p of profiles) {
      if (!p.id || !p.name || !p.chain) throw new Error('Invalid profile structure')
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    return profiles.length
  } catch (e) {
    throw new Error(`Import failed: ${e.message}`)
  }
}

export function duplicateProfile(id, newName) {
  const profile = getProfile(id)
  if (!profile) throw new Error('Profile not found')
  
  return createProfile(
    newName || `${profile.name} (Copy)`,
    profile.chain,
    profile.prefix,
    profile.suffix,
    profile.caseSensitive
  )
}

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
