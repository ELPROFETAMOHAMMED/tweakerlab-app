import type {
  GameConfig,
  GameConfigsResponse,
  GameConfigDownloadResponse
} from '../types/game-configs'

const BASE_URL = '/api/game-configs'

const handleResponse = <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    return response.json()
      .then(error => {
        throw new Error(error.error || `Request failed with status ${response.status}`)
      })
      .catch(() => {
        throw new Error(`Request failed with status ${response.status}`)
      })
  }
  return response.json()
}

const downloadFile = (data: GameConfigDownloadResponse) => {
  const cleanFileName = data.fileName.replace(/\.settings$/, '.ini')
  const blob = new Blob([data.content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = cleanFileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const GameConfigsClientService = {
  getAllGameConfigs: (): Promise<GameConfig[]> =>
    fetch(BASE_URL)
      .then(handleResponse<GameConfigsResponse>)
      .then(response => response.data || []),

  getGameConfigsCount: (): Promise<number> =>
    fetch(`${BASE_URL}/count`)
      .then(handleResponse<{ count: number }>)
      .then(response => response.count || 0)
      .catch(() => 8),

  downloadGameConfig: (gameConfigId: number): Promise<void> =>
    fetch(`${BASE_URL}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameConfigId })
    })
      .then(handleResponse<GameConfigDownloadResponse>)
      .then(downloadFile),

  searchGameConfigs: (query: string): Promise<GameConfig[]> =>
    fetch(`${BASE_URL}?search=${encodeURIComponent(query)}`)
      .then(handleResponse<GameConfigsResponse>)
      .then(response => response.data || []),

  getGameConfigsByCategory: (category: string): Promise<GameConfig[]> =>
    fetch(`${BASE_URL}?category=${encodeURIComponent(category)}`)
      .then(handleResponse<GameConfigsResponse>)
      .then(response => response.data || [])
}
