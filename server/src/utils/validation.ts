import { FieldError, UsernamePasswordInput } from '../resolvers/types';

// Valid email
export const EMAIL_REGEX = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

// Any number or letter
export const NAME_REGEX = /^[a-zA-Z0-9-]{3,10}$/;

export function validateRegisterInput({
  username,
  password,
  email,
}: UsernamePasswordInput) {
  const errors: FieldError[] = [];

  const setError = (field: string, message: string) =>
    errors.push({ field, message });

  if (!NAME_REGEX.test(username)) {
    setError(
      'username',
      'must only contains number or letters and be between 3 and 10 characters'
    );
  }

  if (password.length < 4) {
    setError('password', 'length must be greater than 4 characters');
  }

  if (!EMAIL_REGEX.test(email)) {
    setError('email', 'must be a valid email');
  }

  return errors;
}
