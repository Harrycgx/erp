import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import ActionDrawer, { DrawerSection } from "./ActionDrawer";

export default function EditCustomerDrawer({ isOpen, onClose, customer, onRefresh }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || "",
        contact_person: customer.contact_person || "",
        phone: customer.phone || "",
        email: customer.email || "",
        gst_number: customer.gst_number || "",
        billing_address: customer.billing_address || "",
        shipping_address: customer.shipping_address || "",
        payment_terms: customer.payment_terms || "Net 30",
        is_active: customer.is_active !== false, // Defaults to true
      });
      setError(null);
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) return "Company Name is required.";
    
    // Indian GSTIN Validation: 2 digits, 5 letters, 4 digits, 1 letter, 1 digit, Z, 1 digit/letter
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.gst_number && !gstRegex.test(formData.gst_number.toUpperCase())) {
      return "Invalid GST Number format.";
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      return "Phone number must be between 10 and 15 digits.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      return "Invalid email format.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch current auth user for audit trail
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const { error: updateError } = await supabase
        .from("customers")
        .update({
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          phone: formData.phone,
          email: formData.email,
          gst_number: formData.gst_number.toUpperCase(),
          billing_address: formData.billing_address,
          shipping_address: formData.shipping_address,
          payment_terms: formData.payment_terms,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq("id", customer.id);

      if (updateError) throw updateError;

      onRefresh(); // Trigger parent reload
      onClose();   // Close drawer
    } catch (err) {
      setError(err.message || "Failed to update customer.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 mt-3";

  return (
    <ActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit: ${customer?.company_name || 'Customer'}`}
      actions={[
        { label: "Save Changes", variant: "primary", loading: loading, onClick: handleSubmit }
      ]}
    >
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-xs font-bold">
          {error}
        </div>
      )}

      <DrawerSection title="Company Info">
        <label className={labelClass}>Company Name *</label>
        <input name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} />

        <label className={labelClass}>GST Number</label>
        <input name="gst_number" value={formData.gst_number} onChange={handleChange} className={`${inputClass} uppercase`} placeholder="22AAAAA0000A1Z5" />
        
        <label className="flex items-center space-x-2 mt-4 cursor-pointer">
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 rounded border-slate-700 bg-slate-800" />
          <span className="text-sm font-bold text-slate-300">Active Account</span>
        </label>
      </DrawerSection>

      <DrawerSection title="Contact Details">
        <label className={labelClass}>Contact Person</label>
        <input name="contact_person" value={formData.contact_person} onChange={handleChange} className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </DrawerSection>

      <DrawerSection title="Billing & Shipping">
        <label className={labelClass}>Payment Terms</label>
        <select name="payment_terms" value={formData.payment_terms} onChange={handleChange} className={inputClass}>
          <option value="Advance">Advance</option>
          <option value="Net 15">Net 15</option>
          <option value="Net 30">Net 30</option>
          <option value="Net 60">Net 60</option>
        </select>

        <label className={labelClass}>Billing Address</label>
        <textarea name="billing_address" value={formData.billing_address} onChange={handleChange} className={inputClass} rows="2" />

        <label className={labelClass}>Shipping Address</label>
        <textarea name="shipping_address" value={formData.shipping_address} onChange={handleChange} className={inputClass} rows="2" />
      </DrawerSection>
    </ActionDrawer>
  );
}