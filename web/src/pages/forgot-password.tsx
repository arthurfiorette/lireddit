import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '@/components/InputField';
import { Layout } from '@/components/Layout';
import { useForgotPasswordMutation } from '@/generated/graphql';
import { createUrqlClient } from '@/utils/urql';

const ForgotPassword = (({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          const { data } = await forgotPassword(values);
          setComplete(!!data?.forgotPassword);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we sent you an email
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Layout>
  );
}) as React.FC<{}>;

export default withUrqlClient(createUrqlClient)(ForgotPassword);
