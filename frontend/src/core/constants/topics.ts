export interface VideoTopic {
  id: string
  labelKey: string
  group: 'kind' | 'how'
}

export const VIDEO_TOPICS: VideoTopic[] = [
  { id: 'daily', labelKey: 'topic.daily', group: 'kind' },
  { id: 'story', labelKey: 'topic.story', group: 'kind' },
  { id: 'podcast', labelKey: 'topic.podcast', group: 'kind' },
  { id: 'movie', labelKey: 'topic.movie', group: 'kind' },
  { id: 'comedy', labelKey: 'topic.comedy', group: 'kind' },
  { id: 'music', labelKey: 'topic.music', group: 'kind' },
  { id: 'news', labelKey: 'topic.news', group: 'kind' },
  { id: 'kids', labelKey: 'topic.kids', group: 'kind' },
  { id: 'travel', labelKey: 'topic.travel', group: 'kind' },
  { id: 'food', labelKey: 'topic.food', group: 'kind' },
  { id: 'science', labelKey: 'topic.science', group: 'kind' },
  { id: 'culture', labelKey: 'topic.culture', group: 'kind' },
  { id: 'work', labelKey: 'topic.work', group: 'kind' },
  { id: 'beginner', labelKey: 'topic.beginner', group: 'how' },
  { id: 'slow', labelKey: 'topic.slow', group: 'how' },
  { id: 'vocab', labelKey: 'topic.vocab', group: 'how' },
  { id: 'grammar', labelKey: 'topic.grammar', group: 'how' },
  { id: 'pronounce', labelKey: 'topic.pronounce', group: 'how' },
  { id: 'exam', labelKey: 'topic.exam', group: 'how' },
]

export const TOPIC_BY_ID: Record<string, VideoTopic> = VIDEO_TOPICS.reduce(
  (acc, topic) => {
    acc[topic.id] = topic
    return acc
  },
  {} as Record<string, VideoTopic>,
)

export function topicOrder(id: string): number {
  const idx = VIDEO_TOPICS.findIndex((topic) => topic.id === id)
  return idx < 0 ? VIDEO_TOPICS.length : idx
}
