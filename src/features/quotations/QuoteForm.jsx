import Input from "../../components/ui/Input";

import FormField from "../../components/forms/FormField";

import SelectField from "../../components/forms/SelectField";

export default function QuoteForm({
  formData,
  setFormData,
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FormField label="Customer Name">
        <Input
          value={formData.customer_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              customer_name:
                e.target.value,
            })
          }
        />
      </FormField>

      <FormField label="Quantity">
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({
              ...formData,
              quantity: e.target.value,
            })
          }
        />
      </FormField>

      <FormField label="Box Style">
        <SelectField
          value={formData.box_style}
          onChange={(e) =>
            setFormData({
              ...formData,
              box_style: e.target.value,
            })
          }
          options={[
            {
              label: "Regular Carton",
              value: "Regular Carton",
            },
            {
              label: "Mailer Box",
              value: "Mailer Box",
            },
            {
              label: "Die Cut",
              value: "Die Cut",
            },
          ]}
        />
      </FormField>

      <FormField label="Print Type">
        <SelectField
          value={formData.print_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              print_type: e.target.value,
            })
          }
          options={[
            {
              label: "No Print",
              value: "No Print",
            },
            {
              label: "Flexo",
              value: "Flexo",
            },
            {
              label: "Offset",
              value: "Offset",
            },
          ]}
        />
      </FormField>
    </div>
  );
}