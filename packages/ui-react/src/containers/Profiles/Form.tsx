import { useEffect } from 'react';
import { object, string, type SchemaOf } from 'yup';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useProfileStore } from '@jwp/ott-common/src/stores/ProfileStore';
import useForm, { type UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import type { ProfileFormValues } from '@jwp/ott-common/types/profiles';

import styles from '../../pages/User/User.module.scss';
import Button from '../../components/Button/Button';
import Dropdown from '../../components/Dropdown/Dropdown';
import FormFeedback from '../../components/FormFeedback/FormFeedback';
import TextField from '../../components/TextField/TextField';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import ProfileBox from '../../components/ProfileBox/ProfileBox';

import AVATARS from './avatarUrls.json';
import profileStyles from './Profiles.module.scss';

type Props = {
  initialValues: ProfileFormValues;
  formHandler: UseFormOnSubmitHandler<ProfileFormValues>;
  selectedAvatar?: {
    set: (avatarUrl: string) => void;
    value: string;
  };
  showCancelButton?: boolean;
  showContentRating?: boolean;
  isMobile?: boolean;
};

const Form = ({ initialValues, formHandler, selectedAvatar, showCancelButton = true, showContentRating = false, isMobile = false }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const { profile } = useProfileStore();

  const options: { value: string; label: string }[] = [
    { label: t('profile.adult'), value: 'true' },
    { label: t('profile.kids'), value: 'false' },
  ];

  const validationSchema: SchemaOf<{ name: string }> = object().shape({
    name: string()
      .trim()
      .required(t('profile.validation.name.required'))
      .min(3, t('profile.validation.name.too_short', { charactersCount: 3 }))
      .max(30, t('profile.validation.name.too_long', { charactersCount: 30 }))
      .matches(/^[a-zA-Z0-9\s]*$/, t('profile.validation.name.invalid_characters')),
  });

  const { handleSubmit, handleChange, values, errors, submitting, setValue } = useForm(initialValues, formHandler, validationSchema);
  const isDirty = Object.entries(values).some(([k, v]) => v !== initialValues[k as keyof typeof initialValues]);
  useEffect(() => {
    setValue('avatar_url', selectedAvatar?.value || profile?.avatar_url || '');
  }, [profile?.avatar_url, selectedAvatar?.value, setValue]);

  const formLabel = t('profile.info');

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>{formLabel}</h2>
        </div>
        <div className={profileStyles.profileInfo}>{t('profile.description')}</div>
        <div className={profileStyles.formFields}>
          {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
          {submitting && <LoadingOverlay />}
          <h2 className={profileStyles.nameHeading}>{t('name')}</h2>
          <TextField
            required
            name="name"
            label={t('profile.name')}
            value={values?.name}
            onChange={handleChange}
            error={!!errors.name || !!errors.form}
            helperText={errors.name}
          />
          {showContentRating && (
            <Dropdown
              fullWidth
              required
              name="adult"
              label={t('profile.content_rating')}
              className={styles.dropdown}
              options={options}
              value={values?.adult?.toString() || 'true'}
              onChange={handleChange}
            />
          )}
        </div>
        <hr className={profileStyles.divider} />
        <div className={classNames(styles.panelHeader, profileStyles.noBottomBorder)}>
          <h2>{t('profile.avatar')}</h2>
          <div className={profileStyles.avatarsContainer}>
            {AVATARS.map((avatarUrl) => (
              <ProfileBox
                editMode={false}
                onEdit={() => null}
                onClick={() => selectedAvatar?.set(avatarUrl)}
                selected={selectedAvatar?.value === avatarUrl}
                key={avatarUrl}
                adult={true}
                image={avatarUrl}
              />
            ))}
          </div>
        </div>
        <>
          <Button type="submit" label={t('account.save')} variant="outlined" disabled={!isDirty || submitting} fullWidth={isMobile} />
          {showCancelButton && <Button onClick={() => navigate('/u/profiles')} label={t('account.cancel')} variant="text" fullWidth={isMobile} />}
        </>
      </div>
    </form>
  );
};

export default Form;
