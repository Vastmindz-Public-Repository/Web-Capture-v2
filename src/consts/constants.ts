/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-magic-numbers */
export const Constants = {
  BearerToken: 'Bearer',
  calculateAge: (birthday: any) => {
    const t:any = new Date(birthday)
    const ageDifMs = Date.now() - t
    const ageDate = new Date(ageDifMs)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  },
  welnessScore: [{
    min: -1,
    max: 0,
    definition: 'Insufficient data',
    type: 'undetermined',
    label: 'Insufficient data',
    title: '',
    text: 'Come back tomorrow after collecting additional data to unlock your daily readiness guidance!',
  }, {
    min: 1,
    max: 3,
    definition: 'Low',
    type: 'low',
    label: 'Low',
    title: 'Prioritize recovery',
    // eslint-disable-next-line max-len
    text: 'Your sympathetic activity is overly elevated and your body is under stress. Focus on hydration, supportive nutrition and a solid night\'s sleep.',
  }, {
    min: 4,
    max: 6,
    definition: 'Medium',
    type: 'medium',
    label: 'Medium',
    title: 'Take it easy',
    // eslint-disable-next-line max-len
    text: 'Your HRV is somewhat elevated compared to your baseline. Focus on hydration to replenish energy levels along with supportive nutrition.',
  }, {
    min: 7,
    max: 10,
    definition: 'Optimal',
    type: 'optimal',
    label: 'Optimal',
    title: 'Bring it on!',
    // eslint-disable-next-line max-len
    text: 'Your wellness score indicates that you are well rested and recovered and ready for another day of intense work.',
  }, {
    min: null,
    max: null,
    definition: 'Calculating',
    type: 'calculating',
    label: 'Calculating',
    title: 'Ready soon',
    // eslint-disable-next-line max-len
    text: 'Our wellness score needs at least two readings on two different days. Come back for a reading tomorrow and you\'ll be able to track your wellness score.',
  }],
}