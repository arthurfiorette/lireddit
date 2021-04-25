import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword = (({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const { data } = await changePassword({ ...values, token });
          if (data?.changePassword.errors) {
            const errorMap = toErrorMap(data?.changePassword.errors);

            // Instead of using state and a box, if you have a token error, show it as a newPassword error
            if ('token' in errorMap && !('newPassword' in errorMap)) {
              errorMap.newPassword = errorMap.token;
            }

            setErrors(errorMap);
          } else if (data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="newPassword"
              label="New Password"
              type="password"
            />
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}) as NextPage<{ token: string }>;

ChangePassword.getInitialProps = ({ query }) => {
  return { token: query.token as string };
};

export default withUrqlClient(createUrqlClient)(
  ChangePassword as NextPage<any>
);
