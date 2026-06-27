import Pet, { PET_ARTS, type PetMood } from '@/core/components/Pet'

const MOODS: PetMood[] = ['happy', 'wink', 'love', 'sleepy', 'sleep', 'reading', 'shy', 'confused', 'scared']

export default function PetGalleryDev() {
  return (
    <div style={{ background: '#fdf3ec', minHeight: '100vh', padding: 20 }}>
      <h3>Loài</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {PET_ARTS.map((art) => (
          <div key={art} style={{ width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', font: '700 13px sans-serif', color: '#333' }}>
            <Pet art={art} size={130} mood="happy" />
            <div>{art}</div>
          </div>
        ))}
      </div>
      <h3>Biểu cảm (unicorn)</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {MOODS.map((m) => (
          <div key={m} style={{ width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', font: '700 13px sans-serif', color: '#333' }}>
            <Pet art="unicorn" size={130} mood={m} />
            <div>{m}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
