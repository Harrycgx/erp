import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import DataTable from "../components/tables/DataTable";

import TableToolbar from "../components/tables/TableToolbar";

import CrudModal from "../components/modals/CrudModal";

import QuoteForm from "../features/quotations/QuoteForm";

import { calcPricing } from "../features/quotations/utils/pricingEngine";

import usePermissions from "../features/auth/usePermissions";

import {
  generateQuotationPDF,
} from "../services/pdf/pdfService";

import useAuth from "../features/auth/useAuth";

import { logAudit } from "../services/audit/auditService";

import {
  validateQuotation,
} from "../utils/validation/quotationValidation";

import {
  createLedgerEntry,
} from "../services/finance/financeService";

import {
  createNotification,
} from "../services/notifications/notificationService";

import {
  canTransition,
} from "../services/workflow/workflowService";

import {
  createProductionJob,
} from "../services/production/productionService";

import {
  fetchQuotations,
  createQuotation,
  updateQuotation,
} from "../features/quotations/services/quotationService";

const quotationColumns = [
  {
    key: "quotation_number",
    label: "Quotation No",
  },

  {
    key: "status",
    label: "Status",
  },

  {
    key: "customer_name",
    label: "Customer",
  },

  {
    key: "box_style",
    label: "Box Style",
  },

  {
    key: "print_type",
    label: "Print",
  },

  {
    key: "quantity",
    label: "Quantity",
  },

  {
    key: "estimated_price",
    label: "Estimated Price",
  },
];

export default function Quotations() {
  const [quotations, setQuotations] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [formData, setFormData] =
    useState({
      customer_name: "",
      quantity: "",
      box_style: "Regular Carton",
      print_type: "No Print",
    });

  const {
    hasPermission,
    permissions,
  } = usePermissions();

  const { user } = useAuth();

  useEffect(() => {
    loadQuotations();
  }, []);

  async function loadQuotations() {
    const data =
      await fetchQuotations();

    setQuotations(data || []);
  }

  async function handleCreateQuote() {
    const errors =
  validateQuotation(
    formData
  );

if (
  Object.keys(errors).length > 0
) {
  alert(
    Object.values(errors)[0]
  );

  return;
}
    const pricing = calcPricing(
      {
        length: 12,
        width: 10,
        height: 8,

        qty: formData.quantity,

        box_style:
          formData.box_style,

        print_type:
          formData.print_type,
      },
      {}
    );

    const quotation = {
      quotation_number:
        "QT-" + Date.now(),

      customer_name:
        formData.customer_name,

      quantity:
        Number(formData.quantity),

      box_style:
        formData.box_style,

      print_type:
        formData.print_type,

      estimated_price:
        pricing.total,

      status: "draft",
    };

    await createQuotation(
      quotation
    );

    await logAudit({
      userId: user.id,

      action:
        "created_quotation",

      entityType:
        "quotation",

      entityId:
        quotation.quotation_number,

      metadata: {
        customer:
          quotation.customer_name,

        quantity:
          quotation.quantity,

        estimated_price:
          quotation.estimated_price,
      },
    });

    setOpen(false);

    setFormData({
      customer_name: "",
      quantity: "",
      box_style:
        "Regular Carton",

      print_type:
        "No Print",
    });

    loadQuotations();
  }

  async function moveToSubmitted(
    quotation
  ) {
    const allowed =
      await canTransition({
        entityType:
          "quotation",

        fromState:
          quotation.status,

        toState:
          "submitted",

        permissions,
      });

    if (!allowed) {
      alert(
        "Transition not allowed"
      );

      return;
    }

    await updateQuotation(
      quotation.id,
      {
        status: "submitted",
      }
    );
    await createProductionJob({

  quotation_id:
    quotation.id,

  quotation_number:
    quotation.quotation_number,

  quantity:
    quotation.quantity,

  stage: "planning",

  status: "pending",
});
    await createLedgerEntry({
  entry_type: "debit",

  account_name:
    "Accounts Receivable",

  amount:
    quotation.estimated_price,

  reference_number:
    quotation.quotation_number,

  notes:
    "Quotation approved",
});

await createLedgerEntry({
  entry_type: "credit",

  account_name:
    "Sales Revenue",

  amount:
    quotation.estimated_price,

  reference_number:
    quotation.quotation_number,

  notes:
    "Quotation approved",
});
    await logAudit({
      userId: user.id,

      action:
        "submitted_quotation",

      entityType:
        "quotation",

      entityId:
        quotation.quotation_number,

      metadata: {
        from:
          quotation.status,

        to: "submitted",
      },
    });

    loadQuotations();
  }

  async function moveToApproved(
    quotation
  ) {
    const allowed =
      await canTransition({
        entityType:
          "quotation",

        fromState:
          quotation.status,

        toState:
          "approved",

        permissions,
      });
      await createLedgerEntry({

  entry_type: "debit",

  account_name:
    "Accounts Receivable",

  amount:
    quotation.estimated_price,

  reference_number:
    quotation.quotation_number,
});

await createLedgerEntry({

  entry_type: "credit",

  account_name:
    "Sales Revenue",

  amount:
    quotation.estimated_price,

  reference_number:
    quotation.quotation_number,
});
      await createNotification({
  userId: user.id,

  title:
    "Quotation Approved",

  message:
    quotation.quotation_number +
    " moved to approved state.",

  type: "workflow",
});

    if (!allowed) {
      alert(
        "Approval not allowed"
      );

      return;
    }

    await updateQuotation(
      quotation.id,
      {
        status: "approved",
      }
    );

    await logAudit({
      userId: user.id,

      action:
        "approved_quotation",

      entityType:
        "quotation",

      entityId:
        quotation.quotation_number,

      metadata: {
        from:
          quotation.status,

        to: "approved",
      },
    });

    loadQuotations();
  }

  const filteredQuotations =
    quotations.filter((quote) =>
      quote.customer_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <PageContainer
      title="Quotations"
      subtitle="Manage quotation workflows and customer pricing."
    >
      <TableToolbar
        title="Quotation Records"
        search={search}
        setSearch={setSearch}
        actionLabel={
          hasPermission(
            "manage_quotations"
          )
            ? "Create Quote"
            : null
        }
        onAction={() =>
          setOpen(true)
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        {filteredQuotations.map(
          (quotation) => (
            <div
              key={quotation.id}
              className="
                flex items-center gap-3
                rounded-2xl
                border border-white/10
                bg-white/5
                px-4 py-3
              "
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  {
                    quotation.quotation_number
                  }
                </p>

                <p className="text-xs text-slate-400">
                  {
                    quotation.customer_name
                  }
                </p>
              </div>

              {quotation.status ===
                "draft" && (
                <button
                  onClick={() =>
                    moveToSubmitted(
                      quotation
                    )
                  }
                  className="
                    rounded-xl
                    bg-blue-500
                    px-4 py-2
                    text-sm font-medium
                    text-white
                  "
                >
                  Submit
                </button>
              )}

              {quotation.status ===
                "submitted" && (
                <button
                  onClick={() =>
                    moveToApproved(
                      quotation
                    )
                  }
                  className="
                    rounded-xl
                    bg-green-500
                    px-4 py-2
                    text-sm font-medium
                    text-white
                  "
                >
                  Approve
                </button> 
              )}
              <button
  onClick={() =>
    generateQuotationPDF(
      quotation
    )
  }
  className="
    rounded-xl
    bg-purple-500
    px-4 py-2
    text-sm font-medium
    text-white
  "
>
  PDF
</button>
            </div>
          )
        )}
      </div>

      <DataTable
        columns={quotationColumns}
        data={filteredQuotations}
      />

      {hasPermission(
        "manage_quotations"
      ) && (
        <CrudModal
          open={open}
          onClose={() =>
            setOpen(false)
          }
          title="Create Quotation"
          onSubmit={
            handleCreateQuote
          }
          submitLabel="Save Quote"
        >
          <QuoteForm
            formData={formData}
            setFormData={
              setFormData
            }
          />
        </CrudModal>
      )}
    </PageContainer>
  );
}