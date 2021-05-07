import TimeAgo from 'javascript-time-ago';
// English.
import en from 'javascript-time-ago/locale/en';

if (typeof window !== 'undefined') {
  TimeAgo.addDefaultLocale(en);
}

export const timeAgo = new TimeAgo('en-US');
