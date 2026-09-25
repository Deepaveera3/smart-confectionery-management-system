import React, { useState } from 'react';
import AIRecommendationSection from '../components/AIRecommendationSection';
import ProductDetailModal from '../components/ProductDetailModal';

export default function RecommendationsPage({ onAddToCart }) {
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  return (
    <div style={{ paddingTop: '2rem' }}>
      <AIRecommendationSection 
        onQuickView={(p) => setSelectedProductModal(p)}
        onAddToCart={onAddToCart}
      />

      {selectedProductModal && (
        <ProductDetailModal 
          product={selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}
