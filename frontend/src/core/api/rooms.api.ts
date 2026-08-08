import { apiClient } from './client'

export type RoomMode = 'public' | 'private'
export type RoomLevel = 'beginner' | 'intermediate' | 'advanced'
export type RoomMsgKind = 'text' | 'voice' | 'prompt' | 'joined' | 'left'

export interface RoomCard {
  id: string
  name: string
  topic: string
  lang: string
  level: RoomLevel
  mode: RoomMode
  locked: boolean
  hostId: string
  hostName: string
  size: number
  max: number
  createdAt: string
  invite?: string
  isHost?: boolean
  needPass?: boolean
  member?: boolean
}

export interface RoomMember {
  id: string
  name: string
  avatar: string | null
  frame: string | null
  streak: number
  xp: number
}

export interface RoomMsg {
  id: number
  userId: string | null
  name: string
  avatar: string | null
  kind: RoomMsgKind
  text: string
  audio: boolean
  at: string
}

export interface RoomState {
  room: RoomCard
  members: RoomMember[]
  messages: RoomMsg[]
}

export interface RoomLobby {
  rooms: RoomCard[]
  mine: string | null
  max: number
}

export interface CreateRoomInput {
  name: string
  topic: string
  lang: string
  level: RoomLevel
  mode: RoomMode
  password?: string
}

export type SignalKind = 'offer' | 'answer' | 'ice' | 'bye'

export interface RoomSignal {
  id: number
  from: string
  kind: SignalKind
  payload: string
}

export interface IceConfig {
  iceServers: RTCIceServer[]
  relay: boolean
}

export function fetchIceConfig(): Promise<IceConfig> {
  return apiClient.get<IceConfig>('/api/rooms/ice')
}

export function sendSignal(id: string, to: string, kind: SignalKind, payload: string): Promise<{ ok: boolean }> {
  return apiClient.post<{ ok: boolean }>(`/api/rooms/${encodeURIComponent(id)}/signal`, { to, kind, payload })
}

export function fetchSignals(id: string, after = 0): Promise<{ signals: RoomSignal[] }> {
  return apiClient.get<{ signals: RoomSignal[] }>(`/api/rooms/${encodeURIComponent(id)}/signal?after=${after}`)
}

export interface MatchInput {
  lang: string
  level: RoomLevel
  topics: string[]
  wide: boolean
}

export interface MatchState {
  matched: boolean
  pool: number
  state: RoomState | null
  queued?: boolean
}

export function startMatch(input: MatchInput): Promise<MatchState> {
  return apiClient.post<MatchState>('/api/rooms/match', input)
}

export function pollMatch(): Promise<MatchState> {
  return apiClient.get<MatchState>('/api/rooms/match')
}

export function cancelMatch(): Promise<{ ok: boolean }> {
  return apiClient.post<{ ok: boolean }>('/api/rooms/match/cancel')
}

export function fetchRooms(lang = ''): Promise<RoomLobby> {
  return apiClient.get<RoomLobby>('/api/rooms' + (lang ? '?lang=' + encodeURIComponent(lang) : ''))
}

export function createRoom(input: CreateRoomInput): Promise<RoomState> {
  return apiClient.post<RoomState>('/api/rooms', input)
}

export function peekRoom(id: string): Promise<RoomCard> {
  return apiClient.get<RoomCard>(`/api/rooms/${encodeURIComponent(id)}/peek`)
}

export function joinRoom(id: string, password = '', invite = ''): Promise<RoomState> {
  return apiClient.post<RoomState>(`/api/rooms/${encodeURIComponent(id)}/join`, { password, invite })
}

export function leaveRoom(id: string): Promise<{ ok: boolean }> {
  return apiClient.post<{ ok: boolean }>(`/api/rooms/${encodeURIComponent(id)}/leave`)
}

export function fetchRoomState(id: string, after = 0): Promise<RoomState> {
  return apiClient.get<RoomState>(`/api/rooms/${encodeURIComponent(id)}?after=${after}`)
}

export function sayInRoom(id: string, text: string, audio = '', after = 0): Promise<RoomState> {
  return apiClient.post<RoomState>(`/api/rooms/${encodeURIComponent(id)}/say`, { text, audio, after })
}

export function fetchRoomClip(id: string, msgId: number): Promise<{ audio: string }> {
  return apiClient.get<{ audio: string }>(`/api/rooms/${encodeURIComponent(id)}/clip/${msgId}`)
}

export function askRoomPrompt(id: string, native: string, after = 0): Promise<RoomState> {
  return apiClient.post<RoomState>(`/api/rooms/${encodeURIComponent(id)}/prompt`, { native, after })
}
