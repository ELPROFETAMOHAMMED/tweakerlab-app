import type {
  TweaksResponse,
  DownloadResponse,
  LikeResponse,
  ReportResponse,
  TweaksFilters,
  ReportData
} from '../types/tweaks'

const BASE_URL = '/api/tweaks'

const createParams = (filters?: TweaksFilters) => {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
  }

  return params.toString() ? `?${params.toString()}` : ''
}

const handleResponse = <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    return response.json()
      .then(error => {
        throw new Error(error.error || `Request failed with status ${response.status}`)
      })
  }
  return response.json()
}

const downloadFile = (data: DownloadResponse) => {
  const blob = new Blob([data.content], { type: data.mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = data.fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const TweaksClientService = {
  getAllTweaks: (filters?: TweaksFilters): Promise<TweaksResponse> =>
    fetch(`${BASE_URL}${createParams(filters)}`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(handleResponse<TweaksResponse>),

  getFeaturedTweaks: (limit = 10): Promise<{ tweaks: any[], count: number }> =>
    fetch(`${BASE_URL}/featured?limit=${limit}`)
      .then(response => {
        if (!response.ok) {
          return response.json()
            .then(error => {
              if (response.status === 503) {
                throw new Error(error.error || 'Database not configured')
              }
              throw new Error(error.error || 'Failed to fetch featured tweaks')
            })
        }
        return response.json()
      }),

  getTweaksCount: (): Promise<number> =>
    fetch(`${BASE_URL}/count`)
      .then(response => {
        if (!response.ok) {
          return response.json()
            .then(() => 0)
            .catch(() => 0)
        }
        return response.json()
      })
      .then(data => data.count || 0)
      .catch(() => 0),

  downloadTweak: (tweakId: string): Promise<void> =>
    fetch(`${BASE_URL}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweakId })
    })
      .then(handleResponse<DownloadResponse>)
      .then(downloadFile),

  toggleLike: (tweakId: string, action: 'like' | 'unlike'): Promise<LikeResponse> =>
    fetch(`${BASE_URL}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweakId, action })
    })
      .then(handleResponse<LikeResponse>),

  submitReport: (report: ReportData): Promise<ReportResponse> =>
    fetch(`${BASE_URL}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
      .then(handleResponse<ReportResponse>),

  searchTweaks: (searchTerm: string, limit = 50): Promise<TweaksResponse> =>
    TweaksClientService.getAllTweaks({ search: searchTerm, limit }),

  getTweaksByCategory: (category: string, limit = 20): Promise<TweaksResponse> =>
    TweaksClientService.getAllTweaks({ category, limit }),

  filterTweaks: (filters: TweaksFilters): Promise<TweaksResponse> =>
    TweaksClientService.getAllTweaks(filters)
}
