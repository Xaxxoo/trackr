import { Badge } from '@/components/ui/badge';
import { ProductCategory } from '@/types/product.types';

interface CategoryBadgeProps {
  category: ProductCategory;
}

const categoryColors: Record<ProductCategory, string> = {
  [ProductCategory.RAW_MATERIAL]: 'bg-orange-100 text-orange-800',
  [ProductCategory.FINISHED_GOOD]: 'bg-green-100 text-green-800',
  [ProductCategory.SEMI_FINISHED]: 'bg-blue-100 text-blue-800',
  [ProductCategory.PACKAGING]: 'bg-purple-100 text-purple-800',
  [ProductCategory.CONSUMABLE]: 'bg-gray-100 text-gray-800',
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge variant="outline" className={categoryColors[category]}>
      {category.replace(/_/g, ' ')}
    </Badge>
  );
}