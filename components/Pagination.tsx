"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  // Menentukan nomor halaman yang ditampilkan
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Informasi jumlah data */}
      <p className="text-sm text-gray-600">
        Menampilkan {startItem}–{endItem} dari {totalItems} data
      </p>

      {/* Navigasi halaman */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          {/* Tombol sebelumnya */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Halaman sebelumnya"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>

          {/* Nomor halaman */}
          {pageNumbers.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-7 shrink-0 items-center justify-center text-gray-500 sm:w-9"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition sm:h-9 sm:w-9 ${currentPage === page
                    ? "bg-orange-500 text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {page}
              </button>
            )
          )}

          {/* Tombol berikutnya */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Halaman berikutnya"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}