import { ref, computed } from 'vue'
import { DEFAULT_SOUND_PRESET } from './soundPresets.js'
import { useSound } from './useSound.js'

export const DEFAULT_SUBJECTS = ['언어이해', '자료해석', '창의수리', '언어추리', '수열추리']

export function useTimer() {
  const { playBell, playBreakEnd, previewSound: playPreview, setSoundPreset } = useSound()

  const mode = ref('skct') // 'skct' | 'custom'

  // SKCT settings
  const skctMin = ref(15)
  const skctSec = ref(10)
  const skctBreakMin = ref(1)
  const skctBreakSec = ref(0)

  // Custom settings: flat list of phases
  const customPhases = ref([
    { type: 'study', name: '', min: 25, sec: 0 },
    { type: 'break', name: '', min: 5, sec: 0 },
  ])

  const repeatCount = ref(1)
  const seqIdx = ref(0)
  const currentRepeat = ref(1)
  const remaining = ref(0)
  const total = ref(0)
  const running = ref(false)
  const started = ref(false)
  const finished = ref(false)
  const soundPreset = ref(DEFAULT_SOUND_PRESET)

  let intervalId = null

  const sequence = computed(() => {
    if (mode.value === 'skct') {
      const studyDur = skctMin.value * 60 + skctSec.value
      const breakDur = skctBreakMin.value * 60 + skctBreakSec.value
      const list = []
      DEFAULT_SUBJECTS.forEach((name, i) => {
        list.push({ type: 'subject', name, subjectIdx: i, duration: studyDur })
        if (i < DEFAULT_SUBJECTS.length - 1 && breakDur > 0)
          list.push({ type: 'break', name: '쉬는 시간', duration: breakDur })
      })
      return list
    } else {
      let sIdx = 0
      return customPhases.value
        .map(p => ({
          type: p.type === 'study' ? 'subject' : 'break',
          name: p.name || (p.type === 'study' ? '세션' : '인터벌'),
          subjectIdx: p.type === 'study' ? sIdx++ : undefined,
          duration: p.min * 60 + p.sec,
        }))
        .filter(p => p.duration > 0)
    }
  })

  const studyTotal = computed(() => sequence.value.filter(p => p.type === 'subject').length)

  const currentStudyNum = computed(() => {
    let count = 0
    for (let i = 0; i <= seqIdx.value && i < sequence.value.length; i++) {
      if (sequence.value[i].type === 'subject') count++
    }
    return count
  })

  const currentPhase = computed(() => sequence.value[seqIdx.value] ?? null)
  const isBreak = computed(() => currentPhase.value?.type === 'break')
  const isWarning = computed(() => !isBreak.value && remaining.value <= 60 && started.value)
  const progressPct = computed(() => total.value > 0 ? ((total.value - remaining.value) / total.value) * 100 : 0)

  const nextSubjectName = computed(() => {
    if (!isBreak.value) return null
    for (let i = seqIdx.value + 1; i < sequence.value.length; i++) {
      if (sequence.value[i].type === 'subject') return sequence.value[i].name
    }
    if (currentRepeat.value < repeatCount.value)
      return sequence.value.find(p => p.type === 'subject')?.name ?? null
    return null
  })

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0') }
  const timeStr = computed(() => {
    const r = remaining.value
    return pad(Math.floor(r / 60)) + ':' + pad(r % 60)
  })

  function goToPhase(idx) {
    seqIdx.value = idx
    remaining.value = sequence.value[idx].duration
    total.value = remaining.value
  }

  function tick() {
    if (remaining.value > 0) {
      remaining.value--
    } else {
      isBreak.value ? playBreakEnd() : playBell()
      advance()
    }
  }

  function advance() {
    const next = seqIdx.value + 1
    if (next >= sequence.value.length) {
      if (currentRepeat.value < repeatCount.value) {
        currentRepeat.value++
        goToPhase(0)
      } else {
        clearInterval(intervalId)
        running.value = false
        finished.value = true
      }
      return
    }
    goToPhase(next)
  }

  function start() {
    if (!started.value) {
      started.value = true
      goToPhase(0)
    }
    if (running.value) {
      clearInterval(intervalId)
      running.value = false
    } else {
      intervalId = setInterval(tick, 1000)
      running.value = true
    }
  }

  function skip() { advance() }

  function reset() {
    clearInterval(intervalId)
    running.value = false
    started.value = false
    finished.value = false
    seqIdx.value = 0
    currentRepeat.value = 1
    remaining.value = sequence.value[0]?.duration ?? 0
    total.value = remaining.value
  }

  function applySettings(settings) {
    mode.value = settings.mode
    if (settings.mode === 'skct') {
      skctMin.value = settings.min
      skctSec.value = settings.sec
      skctBreakMin.value = settings.breakMin
      skctBreakSec.value = settings.breakSec
    } else {
      customPhases.value = settings.phases.map(phase => ({ ...phase }))
    }
    repeatCount.value = settings.repeatCount ?? 1
    soundPreset.value = settings.soundPreset ?? DEFAULT_SOUND_PRESET
    setSoundPreset(soundPreset.value)
    reset()
  }

  function stepStatus(i) {
    if (i < seqIdx.value) return 'done'
    if (i === seqIdx.value && started.value) return 'active'
    return 'idle'
  }

  function previewSound(kind = 'bell') {
    if (kind === 'break') playBreakEnd()
    else playPreview(soundPreset.value)
  }

  return {
    mode, skctMin, skctSec, skctBreakMin, skctBreakSec, customPhases, repeatCount, currentRepeat,
    soundPreset,
    studyTotal, currentStudyNum,
    sequence, running, started, finished,
    currentPhase, isBreak, isWarning, progressPct, timeStr, nextSubjectName,
    start, skip, reset, applySettings, previewSound, stepStatus,
  }
}
