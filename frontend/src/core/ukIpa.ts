const IRREGULAR: Record<string, string> = {
  schedule: '/ˈʃed.juːl/',
  either: '/ˈaɪ.ðə/',
  neither: '/ˈnaɪ.ðə/',
  tomato: '/təˈmɑː.təʊ/',
  vitamin: '/ˈvɪt.ə.mɪn/',
  privacy: '/ˈprɪv.ə.si/',
  mobile: '/ˈməʊ.baɪl/',
  missile: '/ˈmɪs.aɪl/',
  herb: '/hɜːb/',
  leisure: '/ˈleʒ.ə/',
  garage: '/ˈɡær.ɑːʒ/',
  advertisement: '/ədˈvɜː.tɪs.mənt/',
  laboratory: '/ləˈbɒr.ə.tri/',
  address: '/əˈdres/',
  adult: '/ˈæd.ʌlt/',
  ballet: '/ˈbæl.eɪ/',
  cafe: '/ˈkæf.eɪ/',
  garbage: '/ˈɡɑː.bɪdʒ/',
  route: '/ruːt/',
  zebra: '/ˈzeb.rə/',
  yogurt: '/ˈjɒɡ.ət/',
  apricot: '/ˈeɪ.prɪ.kɒt/',
  pasta: '/ˈpæs.tə/',
  progress: '/ˈprəʊ.ɡres/',
  process: '/ˈprəʊ.ses/',
  figure: '/ˈfɪɡ.ə/',
  nuclear: '/ˈnjuː.kli.ə/',
  news: '/njuːz/',
  new: '/njuː/',
  duty: '/ˈdʒuː.ti/',
  student: '/ˈstjuː.dənt/',
  stupid: '/ˈstjuː.pɪd/',
  tuna: '/ˈtjuː.nə/',
  tube: '/tjuːb/',
  tuesday: '/ˈtʃuːz.deɪ/',
  produce: '/prəˈdʒuːs/',
  reduce: '/rɪˈdʒuːs/',
  assume: '/əˈsjuːm/',
  dance: '/dɑːns/',
  chance: '/tʃɑːns/',
  france: '/frɑːns/',
  aunt: '/ɑːnt/',
  laugh: '/lɑːf/',
  half: '/hɑːf/',
  calf: '/kɑːf/',
  salt: '/sɒlt/',
  salty: '/ˈsɒl.ti/',
  false: '/fɒls/',
  bald: '/bɔːld/',
  walk: '/wɔːk/',
  talk: '/tɔːk/',
  water: '/ˈwɔː.tə/',
  cause: '/kɔːz/',
  because: '/bɪˈkɒz/',
  although: '/ɔːlˈðəʊ/',
  alternative: '/ɔːlˈtɜː.nə.tɪv/',
  altogether: '/ˌɔːl.təˈɡeð.ə/',
  overall: '/ˌəʊ.vərˈɔːl/',
  crosswalk: '/ˈkrɒs.wɔːk/',
  yacht: '/jɒt/',
  contact: '/ˈkɒn.tækt/',
  podcast: '/ˈpɒd.kɑːst/',
  complicated: '/ˈkɒm.plɪ.keɪ.tɪd/',
  approximately: '/əˈprɒk.sɪ.mət.li/',
  volcano: '/vɒlˈkeɪ.nəʊ/',
  adopt: '/əˈdɒpt/',
  peacock: '/ˈpiː.kɒk/',
  cockroach: '/ˈkɒk.rəʊtʃ/',
  hawk: '/hɔːk/',
  swan: '/swɒn/',
  blond: '/blɒnd/',
  moth: '/mɒθ/',
  wander: '/ˈwɒn.də/',
  want: '/wɒnt/',
  watch: '/wɒtʃ/',
  wash: '/wɒʃ/',
  quality: '/ˈkwɒl.ə.ti/',
  quantity: '/ˈkwɒn.tə.ti/',
  hurry: '/ˈhʌr.i/',
  worried: '/ˈwʌr.id/',
  current: '/ˈkʌr.ənt/',
  currently: '/ˈkʌr.ənt.li/',
}

const BATH = new Set([
  'ask', 'asked', 'answer', 'after', 'afternoon', 'afterward', 'afterwards', 'basket', 'bath', 'bathroom',
  'branch', 'cast', 'castle', 'class', 'classroom', 'classmate', 'command', 'demand', 'disaster', 'draft',
  'example', 'fast', 'glass', 'grant', 'grasp', 'grass', 'last', 'mask', 'master', 'nasty', 'pass',
  'passenger', 'past', 'path', 'plant', 'rather', 'staff', 'task', 'vast', 'advance', 'advantage',
  'blast', 'craft', 'shaft', 'brass', 'raft',
])

const BATH_RISK = /(ass|ast|ask|asp|ath|aft|anc|aun)/

const KEEP_LONG_A = new Set([
  'father', 'palm', 'calm', 'balm', 'spa', 'bra', 'drama', 'lava', 'llama', 'mama', 'papa',
  'plaza', 'taco', 'karate', 'safari', 'nacho', 'mirage',
])

const V = 'aeiouəɪʊɛæʌɑɔɜɒ'
const NEXT_V = `(?=[.ˈˌ]*[${V}])`
const NO_V = `(?![.ˈˌ]*[${V}])`

const re = (body: string) => new RegExp(body, 'g')

function nonRhotic(s: string): string {
  return s
    .replace(/t̬/g, 't')
    .replace(/oʊ/g, 'əʊ')
    .replace(re(`ɝː?${NEXT_V}`), 'ɜːr')
    .replace(/ɝː?/g, 'ɜː')
    .replace(re(`ɚ${NEXT_V}`), 'ər')
    .replace(/ɚ/g, 'ə')
    .replace(re(`ɪr${NO_V}`), 'ɪə')
    .replace(re(`er${NO_V}`), 'eə')
    .replace(re(`ʊr${NO_V}`), 'ʊə')
    .replace(re(`([${V}ː])r${NO_V}`), '$1')
}

export function ukIpa(term: string, usIpa: string): string {
  const key = term.trim().toLowerCase()
  const fixed = IRREGULAR[key]
  if (fixed) return fixed
  if (!usIpa) return ''

  let core = usIpa.replace(/^\/|\/$/g, '')

  if (/er[.ˈˌ]*[aeiouəɪʊɛæʌɑɔɜɒjw]/.test(core) && /arr?[aeiou]/.test(key)) return ''
  if (/ɔːr/.test(core) && /orr/.test(key)) core = core.replace(/ɔːr/g, 'ɒr')

  if (/ɑː(?!r)/.test(core) && !KEEP_LONG_A.has(key)) {
    if (!key.includes('a') && key.includes('o')) core = core.replace(/ɑː(?!r)/g, 'ɒ')
    else return ''
  }

  if (core.includes('æ')) {
    if (BATH.has(key)) core = core.replace(/æ/g, 'ɑː')
    else if (BATH_RISK.test(key)) return ''
  }

  return `/${nonRhotic(core)}/`
}
