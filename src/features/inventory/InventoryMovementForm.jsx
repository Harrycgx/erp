export default function InventoryMovementForm({
  formData,
  setFormData,
}) {
  return (
    <div className="space-y-4">

      <input
        type="text"
        placeholder="Material Name"
        value={
          formData.material_name
        }
        onChange={(e) =>
          setFormData({
            ...formData,
            material_name:
              e.target.value,
          })
        }
        className="
          w-full rounded-xl
          bg-white/5 p-3
          text-white
        "
      />

      <select
        value={
          formData.movement_type
        }
        onChange={(e) =>
          setFormData({
            ...formData,
            movement_type:
              e.target.value,
          })
        }
        className="
          w-full rounded-xl
          bg-white/5 p-3
          text-white
        "
      >
        <option value="purchase">
          Purchase
        </option>

        <option value="damage">
          Damage
        </option>

        <option value="return">
          Return
        </option>

      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={
          formData.quantity
        }
        onChange={(e) =>
          setFormData({
            ...formData,
            quantity:
              e.target.value,
          })
        }
        className="
          w-full rounded-xl
          bg-white/5 p-3
          text-white
        "
      />

    </div>
  );
}