
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import DraggableGrid from "@/components/DraggableGrid";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginatedDraggableGridProps {
  items: Array<{ id: string; [key: string]: any }>;
  onReorder: (items: Array<{ id: string; [key: string]: any }>) => void;
  renderItem: (item: any, index: number) => ReactNode;
  droppableId: string;
  itemsPerPage?: number;
  emptyState?: ReactNode;
}

const PaginatedDraggableGrid = ({
  items,
  onReorder,
  renderItem,
  droppableId,
  itemsPerPage = 8,
  emptyState,
}: PaginatedDraggableGridProps) => {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination({
    totalItems: items.length,
    itemsPerPage,
  });

  const paginatedItems = items.slice(paginatedData.startIndex, paginatedData.endIndex);

  const handleReorder = (reorderedItems: any[]) => {
    // Calculate the global indexes for reordered items
    const startIndex = paginatedData.startIndex;
    const newItems = [...items];
    
    // Replace the items in the current page with reordered items
    reorderedItems.forEach((item, index) => {
      newItems[startIndex + index] = item;
    });

    onReorder(newItems);
  };

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-6">
      <DraggableGrid
        items={paginatedItems}
        onReorder={handleReorder}
        renderItem={renderItem}
        droppableId={`${droppableId}-page-${currentPage}`}
      />

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={goToPreviousPage}
                  className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={goToNextPage}
                  className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="text-center text-sm text-gray-600">
        Showing {paginatedData.startIndex + 1} - {Math.min(paginatedData.endIndex, items.length)} of {items.length} items
      </div>
    </div>
  );
};

export default PaginatedDraggableGrid;
