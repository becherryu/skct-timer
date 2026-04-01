export const SOUND_OPTIONS = [
    {
        id: 'classic-alarm',
        label: '클래식 알람',
        description: '전형적인 알람 시계 느낌의 강한 벨',
        src: '/sounds/classic-alarm.wav',
    },
    {
        id: 'bell-notification',
        label: '벨 노티',
        description: '짧고 또렷하게 울리는 기본 알림음',
        src: '/sounds/bell-notification.wav',
    },
    {
        id: 'double-bell',
        label: '더블 벨',
        description: '두 번 울려서 존재감이 큰 알림',
        src: '/sounds/double-bell.wav',
    },
    {
        id: 'happy-bells-notification',
        label: '해피 벨',
        description: '밝고 경쾌하게 울리는 벨 스타일',
        src: '/sounds/happy-bells-notification.wav',
    },
    {
        id: 'uplifting-bells-notification',
        label: '업리프팅 벨',
        description: '조금 더 상승감 있는 벨 패턴',
        src: '/sounds/uplifting-bells-notification.wav',
    },
    {
        id: 'clean-chime',
        label: '클린 차임',
        description: '부드럽지만 멀리까지 들리는 차임',
        src: '/sounds/clean-chime.wav',
    },
];

export const DEFAULT_SOUND_PRESET = 'happy-bells-notification';
