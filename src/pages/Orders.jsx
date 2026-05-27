import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import { fetchOrders } from "../services/orderService";

const orderColumns = [
  {
    key: "order_number",
    label: "Order No",
  },
  {
    key: "customer_name",
    label: "Customer",
  },
  {
    key: "box_type",
    label: "Box Type",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "total_amount",
    label: "Amount",
  },
  {
    key: "production_status",
    label: "Production",
  },
  {
    key: "payment_status",
    label: "Payment",
  },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const result = await fetchOrders();

        if (result.data) {
          setOrders(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadOrders();
  }, []);

  return (
    <PageContainer
      title="Orders"
      subtitle="Track customer orders, production status and payment workflow."
    >
      <DataTable
        columns={orderColumns}
        data={orders}
      />
    </PageContainer>
  );
}