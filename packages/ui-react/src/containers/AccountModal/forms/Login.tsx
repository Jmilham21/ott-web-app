import React from 'react';
import { object, string, type SchemaOf } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useQueryClient } from 'react-query';
import type { LoginFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import useForm, { type UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useSocialLoginUrls from '@jwp/ott-hooks-react/src/useSocialLoginUrls';

import LoginForm from '../../../components/LoginForm/LoginForm';

type Props = {
  messageKey: string | null;
};

const Login: React.FC<Props> = ({ messageKey }: Props) => {
  const accountController = getModule(AccountController);

  const { siteName } = useConfigStore((s) => s.config);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');

  const socialLoginURLs = useSocialLoginUrls(window.location.href.split('?')[0]);

  const queryClient = useQueryClient();

  const loginSubmitHandler: UseFormOnSubmitHandler<LoginFormData> = async (formData, { setErrors, setSubmitting, setValue }) => {
    try {
      await accountController.login(formData.email, formData.password, window.location.href);
      await queryClient.invalidateQueries(['listProfiles']);

      // close modal
      navigate(modalURLFromLocation(location, null));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          setErrors({ email: t('login.wrong_email') });
        } else {
          setErrors({ form: t('login.wrong_combination') });
        }
        setValue('password', '');
      }
    }

    setSubmitting(false);
  };

  const validationSchema: SchemaOf<LoginFormData> = object().shape({
    email: string().email(t('login.field_is_not_valid_email')).required(t('login.field_required')),
    password: string().required(t('login.field_required')),
  });
  const initialValues: LoginFormData = { email: '', password: '' };
  const { handleSubmit, handleChange, values, errors, submitting } = useForm(initialValues, loginSubmitHandler, validationSchema);

  return (
    <LoginForm
      messageKey={messageKey}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitting={submitting}
      siteName={siteName}
      socialLoginURLs={socialLoginURLs}
    />
  );
};

export default Login;
