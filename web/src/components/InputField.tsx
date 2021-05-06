import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

export const InputField = (({ label, textarea = false, size: _, ...props }) => {
  const [field, { error }] = useField(props);

  const Field = textarea ? Textarea : Input;

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {
        <Field
          {...field}
          {...(props as any)}
          id={field.name}
          placeholder={props.placeholder}
        />
      }
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}) as React.FC<
  InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
    textarea?: boolean;
  }
>;
