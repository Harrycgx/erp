import { useCallback, useMemo, useState } from 'react';
import { buildQuotationFinancials } from '../services/quotationCalculationService';
import {
  createQuotation,
  resolveQuotationNumberPreview,
  updateQuotationRecord,
  validateQuotationData,
} from '../services/quotationService';
import {
  createEmptyQuotation,
  createEmptyQuotationItem,
  normalizeQuotationDraft,
  normalizeQuotationItems,
} from '../utils/quotationState';

export function useQuotationBuilder(initialQuotation = null) {
  const [quotation, setQuotation] = useState(() =>
    initialQuotation ? normalizeQuotationDraft(initialQuotation) : createEmptyQuotation()
  );
  const [items, setItems] = useState(() =>
    initialQuotation?.items?.length ? normalizeQuotationItems(initialQuotation.items) : [createEmptyQuotationItem()]
  );
  const [quotationNumberPreview, setQuotationNumberPreview] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const financials = useMemo(() => buildQuotationFinancials(quotation, items), [quotation, items]);

  const loadPreviewNumber = useCallback(async () => {
    const preview = await resolveQuotationNumberPreview();
    setQuotationNumberPreview(preview);
    return preview;
  }, []);

  const setField = useCallback((field, value) => {
    setQuotation((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setQuotationState = useCallback((nextQuotation, nextItems) => {
    setQuotation(normalizeQuotationDraft(nextQuotation));
    setItems(normalizeQuotationItems(nextItems));
    setValidationErrors([]);
    setError('');
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, createEmptyQuotationItem()]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }, []);

  const validate = useCallback(() => {
    const result = validateQuotationData({ quotation, items });
    setValidationErrors(result.errors);
    return result;
  }, [quotation, items]);

  const save = useCallback(
    async ({ persist = true, actorId = null } = {}) => {
      setSaving(true);
      setError('');
      const validation = validate();
      if (!validation.valid) {
        setSaving(false);
        return { data: null, error: new Error(validation.message) };
      }

      const payload = {
        quotation: {
          ...validation.financials.quotation,
          ...quotation,
          quotation_number: quotation.quotation_number || quotationNumberPreview,
        },
        items: validation.financials.items,
        persist,
      };

      const result = quotation.id
        ? await updateQuotationRecord({ id: quotation.id, ...payload })
        : await createQuotation({ ...payload, actorId });

      if (result.error) {
        setError(result.error.message || 'Unable to save quotation.');
        setSaving(false);
        return result;
      }

      if (result.data?.id) {
        setQuotation((prev) => ({ ...prev, id: result.data.id, quotation_number: result.data.quotation_number }));
      }

      setSaving(false);
      return result;
    },
    [quotation, quotationNumberPreview, validate]
  );

  const reset = useCallback(() => {
    setQuotation(createEmptyQuotation());
    setItems([createEmptyQuotationItem()]);
    setValidationErrors([]);
    setError('');
    setQuotationNumberPreview('');
  }, []);

  return {
    quotation,
    items,
    calculatedItems: financials.items,
    totals: financials.totals,
    quotationPreview: financials.quotation,
    quotationNumberPreview,
    validationErrors,
    saving,
    error,
    setField,
    setQuotationState,
    addItem,
    removeItem,
    updateItem,
    validate,
    save,
    reset,
    loadPreviewNumber,
    setError,
  };
}
