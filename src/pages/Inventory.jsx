import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import InventoryFilters from '../features/inventory/InventoryFilters';
import InventoryTable from '../features/inventory/InventoryTable';
import InventoryCard from '../features/inventory/InventoryCard';
import InventoryFlow from '../features/inventory/InventoryFlow';
import LowStockAlert from '../features/inventory/LowStockAlert';
import MaterialForm from '../features/inventory/MaterialForm';
import StockMovementTable from '../features/inventory/StockMovementTable';
import { fetchInventoryItems, fetchInventoryItemById, insertInventoryItem, updateInventoryItem, deleteInventoryItem, fetchStockMovements } from '../services/inventoryService';
import { fetchSuppliers } from '../services/supplierService';
import { isLowStock } from '../utils/inventoryHelpers';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [filters, setFilters] = useState({ category: '', supplier: '', query: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [itemsResult, suppliersResult] = await Promise.all([fetchInventoryItems(), fetchSuppliers()]);
    if (itemsResult.error || suppliersResult.error) {
      setError(itemsResult.error?.message || suppliersResult.error?.message || 'Unable to load inventory data.');
      setItems([]);
      setSuppliers([]);
    } else {
      setItems(itemsResult.data || []);
      setSuppliers(suppliersResult.data || []);
      if (!selectedItem && itemsResult.data?.length) setSelectedItem(itemsResult.data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadMovements = async () => {
      if (!selectedItem) {
        setMovements([]);
        return;
      }
      const { data, error: movementError } = await fetchStockMovements(selectedItem.id);
      if (!movementError) {
        setMovements(data || []);
      }
    };
    loadMovements();
  }, [selectedItem]);

  const handleSaveMaterial = async (material) => {
    setSaving(true);
    setError('');
    const payload = {
      ...material,
      current_stock: Number(material.current_stock || 0),
      minimum_stock: Number(material.minimum_stock || 0),
      gsm: material.gsm ? Number(material.gsm) : null,
      cost_per_unit: Number(material.cost_per_unit || 0),
      created_at: material.id ? undefined : new Date().toISOString(),
    };

    const response = material.id
      ? await updateInventoryItem(material.id, payload)
      : await insertInventoryItem(payload);

    if (response.error) {
      setError(response.error.message);
    } else {
      await loadData();
      setEditingItem(null);
    }
    setSaving(false);
  };

  const handleDeleteMaterial = async (id) => {
    setSaving(true);
    const { error: deleteError } = await deleteInventoryItem(id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      await loadData();
      setEditingItem(null);
      if (selectedItem?.id === id) setSelectedItem(null);
    }
    setSaving(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = filters.category ? item.category === filters.category : true;
      const supplierMatch = filters.supplier ? (item.supplier || item.supplier_id) === filters.supplier : true;
      const queryMatch = filters.query ? item.material_name?.toLowerCase().includes(filters.query.toLowerCase()) : true;
      return categoryMatch && supplierMatch && queryMatch;
    });
  }, [items, filters]);

  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items]);

  const metrics = useMemo(
    () => [
      { value: items.length, label: 'Materials tracked' },
      { value: items.filter((item) => isLowStock(item)).length, label: 'Low stock items' },
      { value: [...new Set(items.map((item) => item.warehouse_location || item.storage_location).filter(Boolean))].length, label: 'Warehouse zones' },
    ],
    [items]
  );

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Raw material control"
            title="Inventory management and raw material tracking"
            description="Manage material stock, prevent shortages, and keep warehouse movements aligned with production demand."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <InventoryFilters filters={filters} onChange={setFilters} categories={categories} suppliers={suppliers} />

        <InventoryFlow items={items} selectedItem={selectedItem} movements={movements} onSelectItem={setSelectedItem} />

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.75fr]">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.slice(0, 3).map((item) => (
                <InventoryCard key={item.id} item={item} onSelect={setSelectedItem} />
              ))}
            </div>
            <InventoryTable
              items={filteredItems}
              suppliers={suppliers}
              onSelectItem={setSelectedItem}
              onEditItem={(item) => {
                setEditingItem(item);
                setSelectedItem(item);
              }}
            />
          </div>

          <div className="space-y-8">
            <LowStockAlert items={items} />
            <MaterialForm
              item={editingItem}
              suppliers={suppliers}
              onSubmit={handleSaveMaterial}
              onDelete={handleDeleteMaterial}
              loading={saving}
            />
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
            <div className="mb-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Stock movement</p>
              <h2 className="mt-2 text-2xl font-black text-white">Recent material transactions</h2>
            </div>
            <StockMovementTable movements={movements} />
          </div>
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Selected material</p>
            <h2 className="mt-2 text-2xl font-black text-white">{selectedItem?.material_name || 'No material selected'}</h2>
            <p className="mt-3 text-sm text-slate-400">{selectedItem?.category || 'Choose a material to inspect stock movement and warehouse data.'}</p>
          </div>
        </div>
      </Container>
    </main>
  );
}
