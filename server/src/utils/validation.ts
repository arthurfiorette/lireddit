import { PostInput } from '../resolvers/post';
import { FieldError, UsernamePasswordInput } from '../resolvers/user';
import { validate } from 'typed-core/dist/validator';

// Valid email
export const EMAIL_REGEX = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

// Any number or letter
export const NAME_REGEX = /^[a-zA-Z0-9-]{3,10}$/;

export async function validateRegisterInput(
  input: UsernamePasswordInput
): Promise<FieldError[]> {
  return validate(input, ({ parse }) => {
    parse(
      'username',
      (u) => NAME_REGEX.test(u),
      'must only contains number or letters and be between 3 and 10 characters'
    );

    parse(
      'password',
      (p) => p.length > 4,
      'length must be greater than 4 characters'
    );

    parse('email', (e) => EMAIL_REGEX.test(e), 'must be a valid email');
  });
}

export async function validateCreatePostInput(
  input: PostInput
): Promise<FieldError[]> {
  return await validate(input, ({ parse }) => {
    parse(
      'title',
      (t) => t.split(' ').length >= 2,
      'a title must have at least two words'
    );

    parse('text', (t) => !!t, 'a post must have an not empty content');
  });
}
