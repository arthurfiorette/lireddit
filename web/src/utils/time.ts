import TimeAgo from 'javascript-time-ago';
// English.
import en from 'javascript-time-ago/locale/en';

try {
  TimeAgo.addDefaultLocale(en);
} catch (e) {
  // When adding the default locale several times,
  // an error is thrown and I did not find the way
  // to know when it will be
}

export const timeAgo = new TimeAgo();
