import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, Sparkles, ShoppingBag, CheckCircle, Palette, Layers, Heart, ShieldCheck, Award, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CAKE_SIZES = [
  { id: '1kg', label: '1 Kg (1 Tier)', basePrice: 999, serves: '6 - 8 Guests' },
  { id: '2kg', label: '2 Kg (2 Tiers)', basePrice: 1899, serves: '12 - 15 Guests' },
  { id: '3kg', label: '3 Kg (2 Tiers)', basePrice: 2699, serves: '20 - 25 Guests' },
  { id: '5kg', label: '5 Kg (3 Tiers)', basePrice: 4499, serves: '40 - 50 Guests' }
];

const SPONGE_FLAVORS = [
  { id: 'dark-truffle', name: 'Belgian Dark Chocolate', extra: 100, desc: 'Rich 70% cocoa dark chocolate sponge' },
  { id: 'red-velvet', name: 'Royal Red Velvet', extra: 150, desc: 'Classic crimson cocoa sponge with buttermilk' },
  { id: 'vanilla', name: 'Madagascar Vanilla Bean', extra: 0, desc: 'Fluffy sponge infused with natural vanilla pods' },
  { id: 'caramel-walnut', name: 'Salted Caramel Walnut', extra: 120, desc: 'Caramel infused sponge with roasted walnut bits' },
  { id: 'hazelnut', name: 'Hazelnut Praline', extra: 180, desc: 'Nutty roasted hazelnut sponge with rocher crunch' },
  { id: 'mango', name: 'Exotic Mango Passionfruit', extra: 150, desc: 'Tropical fruit compote sponge with citrus zests' }
];

const FROSTINGS = [
  { id: 'truffle-ganache', name: 'Belgian Dark Truffle Ganache', extra: 100 },
  { id: 'cream-cheese', name: 'Royal Cream Cheese Frosting', extra: 120 },
  { id: 'swiss-buttercream', name: 'Swiss Meringue Buttercream', extra: 80 },
  { id: 'chantilly', name: 'Whipped Vanilla Chantilly', extra: 0 },
  { id: 'caramel-drizzle', name: 'Salted Caramel Drizzle Cream', extra: 100 }
];

const COLOR_PALETTES = [
  { id: 'maroon-gold', name: 'Royal Gold & Maroon (Sweet Haven Signature)', colorHex: '#58111A' },
  { id: 'rose-ivory', name: 'Pastel Rose & Ivory', colorHex: '#E8A598' },
  { id: 'midnight-gold', name: 'Midnight Chocolate & Gold Leaf', colorHex: '#2A1810' },
  { id: 'white-champagne', name: 'Classic White & Champagne Gold', colorHex: '#F7F3E9' },
  { id: 'emerald-gold', name: 'Emerald Green & Metallic Accents', colorHex: '#1B4D3E' }
];

const TOPPINGS = [
  { id: 'berries-flowers', name: 'Fresh Berries & Edible Flowers', extra: 200 },
  { id: 'gold-macarons', name: '24K Gold Leaf & French Macarons', extra: 250 },
  { id: 'ferrero-nuts', name: 'Roasted Ferrero Rocher & Nuts', extra: 180 },
  { id: 'chocolate-shavings', name: 'Belgian Chocolate Shavings & Pearls', extra: 120 },
  { id: 'sugar-flowers', name: 'Handcrafted Sugar Blossoms', extra: 150 }
];

export default function CustomCakePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(CAKE_SIZES[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(SPONGE_FLAVORS[0]);
  const [selectedFrosting, setSelectedFrosting] = useState(FROSTINGS[0]);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [selectedTopping, setSelectedTopping] = useState(TOPPINGS[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedMessage, setAddedMessage] = useState('');

  // Total Price Calculation
  const totalPrice = selectedSize.basePrice + selectedFlavor.extra + selectedFrosting.extra + selectedTopping.extra;

  const handleAddToCart = async () => {
    const customCakeProduct = {
      id: `custom-cake-${Date.now()}`,
      name: `Custom Artisan Cake (${selectedSize.label})`,
      category: 'Custom Cakes',
      price: totalPrice,
      discount: 0,
      stock_quantity: 99,
      weight_size: selectedSize.label,
      image: '/custom_cake.jpg',
      customDetails: {
        size: selectedSize.label,
        sponge: selectedFlavor.name,
        frosting: selectedFrosting.name,
        colorTheme: selectedPalette.name,
        toppings: selectedTopping.name,
        inscription: customMessage.trim() || 'No Message Specified',
        instructions: specialInstructions.trim() || 'None'
      }
    };

    const res = await addToCart(customCakeProduct, 1);
    if (res && res.success) {
      setAddedMessage('Custom Cake added to cart successfully!');
      setTimeout(() => setAddedMessage(''), 4000);
      navigate('/cart');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--cream-light)', padding: '3rem 0 5rem 0', minHeight: '90vh' }}>
      <div className="container">
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1.2rem',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '50px',
            color: 'var(--maroon-primary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            <Sparkles size={16} style={{ color: 'var(--gold-primary)' }} />
            Artisan Customization Studio
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--chocolate-dark)',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.75rem'
          }}>
            Craft Your Custom Celebration Cake
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Choose from master pâtissier sponge flavors, velvet frostings, luxury color themes, and hand-finished artisan toppings for your memorable occasion.
          </p>
        </div>

        {addedMessage && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #c3e6cb',
            fontWeight: '600'
          }}>
            <CheckCircle size={20} />
            {addedMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Customization Options Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Step 1: Cake Tier & Weight */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Layers size={20} style={{ color: 'var(--gold-primary)' }} />
                1. Select Size & Tiers
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {CAKE_SIZES.map(s => {
                  const isSelected = selectedSize.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--maroon-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(88, 17, 26, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: '700', color: 'var(--chocolate-dark)', fontSize: '1.05rem' }}>{s.label}</div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.3rem 0' }}>{s.serves}</div>
                      <div style={{ fontWeight: '600', color: 'var(--maroon-primary)', fontSize: '0.95rem' }}>₹{s.basePrice}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Sponge Flavor */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Cake size={20} style={{ color: 'var(--gold-primary)' }} />
                2. Select Sponge Flavor
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {SPONGE_FLAVORS.map(f => {
                  const isSelected = selectedFlavor.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFlavor(f)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--maroon-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(88, 17, 26, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--chocolate-dark)' }}>{f.name}</div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                      </div>
                      <div style={{ fontWeight: '600', color: 'var(--maroon-primary)', fontSize: '0.9rem' }}>
                        {f.extra > 0 ? `+₹${f.extra}` : 'Included'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Velvet Frosting */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Heart size={20} style={{ color: 'var(--gold-primary)' }} />
                3. Select Velvet Frosting
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {FROSTINGS.map(fr => {
                  const isSelected = selectedFrosting.id === fr.id;
                  return (
                    <div
                      key={fr.id}
                      onClick={() => setSelectedFrosting(fr)}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--maroon-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(88, 17, 26, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--chocolate-dark)' }}>{fr.name}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--maroon-primary)' }}>
                        {fr.extra > 0 ? `+₹${fr.extra}` : 'Free'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Color Palette & Toppings */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Palette size={20} style={{ color: 'var(--gold-primary)' }} />
                4. Theme Palette & Artisan Toppings
              </h3>
              
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>
                Color Palette Theme:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {COLOR_PALETTES.map(p => {
                  const isSelected = selectedPalette.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPalette(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '25px',
                        border: isSelected ? '2px solid var(--maroon-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(88, 17, 26, 0.08)' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--chocolate-dark)'
                      }}
                    >
                      <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: p.colorHex, border: '1px solid #ccc' }} />
                      {p.name}
                    </button>
                  );
                })}
              </div>

              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>
                Artisan Toppings:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {TOPPINGS.map(t => {
                  const isSelected = selectedTopping.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopping(t)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--maroon-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(88, 17, 26, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--chocolate-dark)' }}>{t.name}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--maroon-primary)' }}>+₹{t.extra}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Custom Message & Inscription */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MessageSquare size={20} style={{ color: 'var(--gold-primary)' }} />
                5. Inscription & Special Instructions
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--chocolate-dark)', fontSize: '0.9rem' }}>
                  Cake Message Inscription (Piped on Chocolate Plaque):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Happy 25th Birthday Sarah! 🎉"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--chocolate-dark)', fontSize: '0.9rem' }}>
                  Chef & Bakery Special Notes:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Less sugar on frosting, eggless requirement, delivery timing preferences..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

          </div>

          {/* Live Order Summary & Preview Right Column */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}>
              
              {/* Preview Image Header */}
              <div style={{ position: 'relative', height: '240px', backgroundColor: 'var(--chocolate-dark)' }}>
                <img
                  src="/custom_cake.jpg"
                  alt="Custom Cake Studio Creation"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/hero_cake.jpg';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(88, 17, 26, 0.85)',
                  color: '#ffffff',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Award size={14} style={{ color: 'var(--gold-primary)' }} />
                  Sweet Haven Master Pâtissier Recipe
                </div>
              </div>

              {/* Summary Details */}
              <div style={{ padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '1.35rem', marginBottom: '1rem', fontWeight: '700' }}>
                  Custom Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cake Size:</span>
                    <strong style={{ color: 'var(--chocolate-dark)' }}>{selectedSize.label}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sponge Flavor:</span>
                    <strong style={{ color: 'var(--chocolate-dark)' }}>{selectedFlavor.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Velvet Frosting:</span>
                    <strong style={{ color: 'var(--chocolate-dark)' }}>{selectedFrosting.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Color Theme:</span>
                    <strong style={{ color: 'var(--chocolate-dark)' }}>{selectedPalette.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Artisan Topping:</span>
                    <strong style={{ color: 'var(--chocolate-dark)' }}>{selectedTopping.name}</strong>
                  </div>
                  {customMessage.trim() && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '0.6rem 0.8rem', borderRadius: '8px', marginTop: '0.2rem' }}>
                      <span style={{ color: 'var(--maroon-primary)', fontWeight: '600' }}>Inscription:</span>
                      <strong style={{ color: 'var(--chocolate-dark)', fontStyle: 'italic' }}>"{customMessage.trim()}"</strong>
                    </div>
                  )}
                </div>

                {/* Price Calculation Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Base Tier Price ({selectedSize.label})</span>
                    <span>₹{selectedSize.basePrice}</span>
                  </div>
                  {selectedFlavor.extra > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Sponge Premium ({selectedFlavor.name})</span>
                      <span>+₹{selectedFlavor.extra}</span>
                    </div>
                  )}
                  {selectedFrosting.extra > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Frosting Extra ({selectedFrosting.name})</span>
                      <span>+₹{selectedFrosting.extra}</span>
                    </div>
                  )}
                  {selectedTopping.extra > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Topping Extra ({selectedTopping.name})</span>
                      <span>+₹{selectedTopping.extra}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--cream-light)',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '1px dashed var(--gold-primary)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Calculated Price</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--maroon-primary)' }}>₹{totalPrice}</div>
                  </div>
                  <ShieldCheck size={28} style={{ color: 'var(--gold-primary)' }} />
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="btn btn-gold"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    boxShadow: '0 6px 20px rgba(88, 17, 26, 0.25)'
                  }}
                >
                  <ShoppingBag size={20} />
                  Add Custom Cake to Order
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
