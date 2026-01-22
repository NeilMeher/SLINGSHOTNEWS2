
import { NewsItem } from './types';

export const NEWS_DATA: NewsItem[] = [
  {
    id: '1',
    category: 'TECH',
    categoryColor: 'bg-primary',
    time: '2h ago',
    title: 'Apple Vision Pro sales flopping harder than expected 💀',
    bullets: [
      'Sales down across all major regions',
      'Supply chain orders cut by 40%',
      'Worse retention than Meta Quest'
    ],
    source: 'The Verge',
    sourceLogo: 'V',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwutoDocNRia30ltJ0oOysQUpFx_6lsHLswlZl3zSp26S9lyxrVeQtlb0zThzWnYjP-SzVG-xZsM3X74dz_nMEPMEN0kqJlotTOgLPrmdJxOoZXNRVSlmiX3eDZ8DYAgqA_qHkbryvPBZdtZNAGibFFqIV0lOCUE4cPCLKWig7MfZQO8gvOLJJ1fBnWgAAPTZGQIFJD9f-rnXqXjDT0cXRsV8YFYnyEplu1Xoomkw6cY3SaPz9iOP4Yfm8Y8FuxksuXXJJL3Z6lcI',
    stats: { w: '12.5k', mid: '204', reaction: '4.2k', reactionEmoji: '💀', cap: '89' }
  },
  {
    id: '2',
    category: 'CULTURE',
    categoryColor: 'bg-purple-500',
    time: '45m ago',
    title: 'TikTok ban bill just passed the Senate 🚨',
    bullets: [
      'President expected to sign into law tomorrow',
      'ByteDance has 9 months to divest',
      'Creators panicking, moving to Reels'
    ],
    source: 'CNN Business',
    sourceLogo: 'C',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbg0Ue8YPORYebULHIr2G60Nlo2_oJQ_-KTXVQjHCE3khEYcnnZF9fsU0tgJcd5gjR1UEPkW69xNsHMECjB04vDKLnPAKKTp8gFoNWZI0qwGWpO7oV7s33em9WlSBDCDyFd1eZrF9fJEycko4t3EeSqfV8NghDFV58t7t_XFIOFJHJjp7pAB9aF0gRd-FE8O6xZSOu5eob6ImhG5YnWIhyDFfsbuCjz2M2txGTYvF-tryB6B46bB7SvoH2UTrlD6ELWJbCyasUYMA',
    stats: { w: '89k', mid: '1.2k', reaction: '500', reactionEmoji: '🔥', cap: '12' }
  },
  {
    id: '3',
    category: 'GAMING',
    categoryColor: 'bg-emerald-500',
    time: '3h ago',
    title: 'GTA VI trailer 2 might drop next week 🔥',
    bullets: [
      'Leak claims Rockstar gearing up',
      'Take-Two stock jumps 4%',
      'Map size rumored 2x larger than GTA V'
    ],
    source: 'IGN',
    sourceLogo: 'I',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwzMaceUlMcilT041cDqTgCguDaOFuPgxqZcjT2HPqIZDgruZu3GUJOJWL5bgzzOoiYj_pRlgoQyPx1qPqGH1_1PLj3jxeZQWQ3NprW595ItuKF7tGkY8kXO6Zk6-toEWHFI5a6Mh5bgQqLunBhvxnnVTh7-Hayt3hCEl9TG8BcCtXwwoKFGDe40l6B3U8nwcqaYu5xDfHLqzhicaiEB5ePxdzjn4hQ-mlVtiie5kvhAxu8CnHRn1gIMlffr5QlV7epEPJ2-jQesU',
    stats: { w: '55k', mid: '22k', reaction: '1k', reactionEmoji: '🎮', cap: '400' }
  }
];
