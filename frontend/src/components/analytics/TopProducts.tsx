import { TopProduct } from "../../types/analytics.types";
import { Eye, ShoppingCart } from "lucide-react";

interface TopProductsProps {
  products: TopProduct[];
}

export const TopProducts = ({ products }: TopProductsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products Today</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                Rank
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                Product Name
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Views</span>
                </div>
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Purchases</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No product data available
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.productId}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-xs text-gray-500">ID: {product.productId.slice(0, 8)}...</p>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                      {product.views}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-sm">
                      {product.purchases}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
