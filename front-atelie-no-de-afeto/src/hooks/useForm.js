import { useState } from 'react';

/**
 * 
 * @param {Object} initialValues 
 * @param {Function} validateFn 
 */
export function useForm(initialValues, validateFn = () => ({})) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const setField = (name) => (e) =>
    setValues((prev) => ({ ...prev, [name]: e.target.value }));

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setApiError('');
    setSuccess('');
  };

  const submit = async (asyncFn) => {
    setApiError('');
    setSuccess('');
    const errs = validateFn(values);
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    setErrors({});
    setLoading(true);
    try {
      await asyncFn(values);
      return true;
    } catch (err) {
      setApiError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { values, errors, apiError, success, loading, handleChange, setField, reset, submit, setSuccess, setValues };
}