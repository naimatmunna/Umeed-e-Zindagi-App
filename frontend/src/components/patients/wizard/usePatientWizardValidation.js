import { useCallback, useMemo, useState } from 'react';
import { REQUIRED_DOCUMENT_TYPES } from '@/constants/patient.js';
import {
  getFirstErrorStep,
  getStepsWithErrors,
  validateField,
  validateWizardStep,
  validateAllSteps,
} from './wizardValidation.js';

export function usePatientWizardValidation(form, t, docState = {}) {
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const touch = useCallback((path) => {
    setTouched((prev) => (prev[path] ? prev : { ...prev, [path]: true }));
  }, []);

  const touchStep = useCallback((step) => {
    const stepErrors = validateWizardStep(step, form, t);
    setTouched((prev) => {
      const next = { ...prev };
      Object.keys(stepErrors).forEach((path) => {
        next[path] = true;
      });
      return next;
    });
  }, [form, t]);

  const touchAll = useCallback(() => {
    const all = validateAllSteps(form, t, { includeDocuments: true, ...docState });
    setTouched((prev) => {
      const next = { ...prev };
      Object.keys(all).forEach((path) => {
        next[path] = true;
      });
      return next;
    });
    setSubmitAttempted(true);
  }, [form, t, docState]);

  const getFieldError = useCallback(
    (path) => {
      if (path.startsWith('documents.')) {
        const type = path.replace('documents.', '');
        const pending = docState.pendingDocuments?.[type];
        if (pending?.error) return pending.error;
        if (touched[path] || submitAttempted) {
          if (
            REQUIRED_DOCUMENT_TYPES.includes(type) &&
            !pending?.file &&
            !docState.existingDocuments?.[type]
          ) {
            return t('validation.documentRequired', { type: t(`documents.types.${type}`) });
          }
        }
        return '';
      }

      const msg = validateField(path, form, t);
      if (!msg) return '';
      if (touched[path] || submitAttempted) return msg;
      return '';
    },
    [form, t, touched, submitAttempted, docState],
  );

  const stepErrors = useMemo(() => {
    const map = {};
    for (let s = 1; s <= 9; s += 1) {
      map[s] = validateWizardStep(s, form, t);
    }
    const docErrors = validateAllSteps(form, t, { includeDocuments: true, ...docState });
    const step8 = { ...(map[8] ?? {}) };
    Object.entries(docErrors)
      .filter(([k]) => k.startsWith('documents.'))
      .forEach(([k, v]) => {
        step8[k] = v;
      });
    if (Object.keys(step8).length) map[8] = step8;
    return map;
  }, [form, t, docState]);

  const stepsWithErrors = useMemo(() => {
    const visible = {};
    Object.entries(stepErrors).forEach(([step, errs]) => {
      const hasVisible = Object.keys(errs).some((path) => touched[path] || submitAttempted);
      if (hasVisible && Object.keys(errs).length) visible[Number(step)] = true;
    });
    return visible;
  }, [stepErrors, touched, submitAttempted]);

  const allSubmitErrors = useMemo(
    () => validateAllSteps(form, t, { includeDocuments: true, ...docState }),
    [form, t, docState],
  );

  return {
    touched,
    touch,
    touchStep,
    touchAll,
    getFieldError,
    stepErrors,
    stepsWithErrors,
    allSubmitErrors,
    submitAttempted,
    setSubmitAttempted,
    getFirstErrorStep: () => getFirstErrorStep(allSubmitErrors),
    getStepsWithErrors: () => getStepsWithErrors(allSubmitErrors),
  };
}
