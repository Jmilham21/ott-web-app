import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';

import styles from './ResetPasswordForm.module.scss';

type Props = {
  onCancel: () => void;
  onReset: () => void;
  submitting: boolean;
};

const ResetPasswordForm: React.FC<Props> = ({ onCancel, onReset, submitting }: Props) => {
  const { t } = useTranslation('account');
  return (
    <div className={styles.resetPassword} role="dialog" aria-labelledby="reset_password">
      <h1 id="reset_password" className={styles.title}>
        {t('reset.reset_password')}
      </h1>
      <p className={styles.text}>{t('reset.text')}</p>
      <Button onClick={onReset} className={styles.button} fullWidth color="primary" label={t('reset.yes')} disabled={submitting} />
      <Button onClick={onCancel} fullWidth label={t('reset.no')} />
    </div>
  );
};

export default ResetPasswordForm;
