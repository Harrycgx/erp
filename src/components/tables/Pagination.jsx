import Button from "../ui/Button";

export default function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrev,
}) {
  return (
    <div className="mt-6 flex items-center justify-between rounded-3xl border border-white/10 bg-[#111827] p-5">
      <p className="text-slate-400">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onPrev}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <Button
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}