import React, { type ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import HelperText from '../HelperText/HelperText';

import styles from './Dropdown.module.scss';

type Props = {
  name: string;
  value: string;
  className?: string;
  defaultLabel?: string;
  options?: (string | { value: string; label: string })[];
  optionsStyle?: string;
  label?: ReactNode;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
  required?: boolean;
  onChange: React.ChangeEventHandler;
  testId?: string;
};

const Dropdown: React.FC<Props & React.AriaAttributes> = ({
  name,
  value,
  className,
  defaultLabel,
  options,
  onChange,
  optionsStyle,
  label,
  fullWidth,
  error,
  helperText,
  required = false,
  size = 'medium',
  testId,
  ...rest
}: Props & React.AriaAttributes) => {
  const { t } = useTranslation('common');
  const id = useOpaqueId();

  return (
    <div className={classNames(styles.container, { [styles.fullWidth]: fullWidth, [styles.error]: error }, styles[size], className)} data-testid={testId}>
      {(label || !required) && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {!required ? <span>{t('optional')}</span> : null}
        </label>
      )}
      <div className={classNames(styles.dropdown, { [styles.fullWidth]: fullWidth })}>
        <select id={id} className={styles.select} name={name} value={value} onChange={onChange} aria-required={required} {...rest}>
          {defaultLabel && (
            <option className={classNames(styles.option, optionsStyle)} value="" disabled={required}>
              {defaultLabel}
            </option>
          )}
          {options &&
            options.map((option) => (
              <option
                className={classNames(styles.option, optionsStyle)}
                key={typeof option === 'string' ? option : option.value}
                value={typeof option === 'string' ? option : option.value}
              >
                {typeof option === 'string' ? option : option.label}
              </option>
            ))}
        </select>
      </div>
      <HelperText error={error}>{helperText}</HelperText>
    </div>
  );
};

export default Dropdown;
