import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, X, Sparkles, History, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function SearchBar({ productsList: propProducts, categoriesList: propCategories, onSelectProduct }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState(propProducts || []);
  const [categories, setCategories] = useState(propCategories || []);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('sweet_haven_search_history');
    if (savedHistory) {
      try {
        setRecentSearches(JSON.parse(savedHistory));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts);
    } else {
      apiService.getPublicProducts().then(res => {
        if (res && res.success && res.products) setProducts(res.products);
      }).catch(() => {});
    }

    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      apiService.getCategories().then(res => {
        if (res && res.success && res.categories) setCategories(res.categories);
      }).catch(() => {});
    }
  }, [propProducts, propCategories]);

  const saveRecentSearch = (term) => {
    if (!term || term.trim().length < 2) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(t => t.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('sweet_haven_search_history', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('sweet_haven_search_history');
  };

  // Live suggestions filter
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const matches = products.filter(p => {
      const matchName = (p.name || '').toLowerCase().includes(cleanQuery);
      const matchCategory = (p.category || '').toLowerCase().includes(cleanQuery);
      const matchDesc = (p.description || '').toLowerCase().includes(cleanQuery);
      const matchIngredients = (p.ingredients || '').toLowerCase().includes(cleanQuery);
      const matchCatFilter = selectedCategory === 'All' || p.category === selectedCategory;
      return (matchName || matchCategory || matchDesc || matchIngredients) && matchCatFilter;
    });

    setSuggestions(matches.slice(0, 5));
  }, [query, selectedCategory, products]);

  // Voice Search Handler
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice search is not supported in this browser. Try typing in the search box.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... Speak your dessert search (e.g. "Dark Truffle Cake")');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        saveRecentSearch(transcript);
        setIsListening(false);
        setVoiceNotice(`Searching for: "${transcript}"`);
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNotice('Voice recognition paused. Please try again.');
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setVoiceNotice('Voice search initialization error.');
      setTimeout(() => setVoiceNotice(null), 3000);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleSelectProduct = (product) => {
    saveRecentSearch(product.name);
    if (onSelectProduct) onSelectProduct(product);
    setQuery('');
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div className="search-bar-wrap" style={{ position: 'relative', maxWidth: '650px', margin: '0 auto' }}>
      <div className="search-bar-inner" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '6px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {/* Category Select Filter */}
        <select 
          className="search-category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '8px 12px', border: 'none', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: '#334155', cursor: 'pointer', marginRight: '8px' }}
        >
          <option value="All">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Input */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ color: '#94a3b8', marginRight: '8px' }} />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder='Try searching "Belgian Truffle Cake", "Brownies", or "Under ₹500"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                saveRecentSearch(query.trim());
              }
            }}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '500', color: '#0f172a' }}
          />
          {query && (
            <button onClick={handleClear} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }} title="Clear Search">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Voice Search Button */}
        <button 
          onClick={startVoiceSearch}
          style={{
            border: 'none',
            backgroundColor: isListening ? '#fef2f2' : '#fdf2f8',
            color: isListening ? '#dc2626' : '#be185d',
            padding: '8px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginLeft: '8px',
            transition: 'all 0.2s ease'
          }}
          title="Voice Search"
        >
          <Mic size={16} className={isListening ? 'animate-pulse' : ''} />
          <span>{isListening ? 'Listening...' : 'Voice'}</span>
        </button>
      </div>

      {/* Voice Status Notice */}
      {voiceNotice && (
        <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', color: '#be185d', padding: '8px 14px', borderRadius: '10px', marginTop: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} />
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* Suggestions or Recent Searches Dropdown */}
      {((query.trim() && suggestions.length > 0) || (isFocused && !query.trim() && recentSearches.length > 0)) && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 15px 30px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
          
          {/* Query Suggestions */}
          {query.trim() ? (
            <div>
              <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                Matching Confectionery Items ({suggestions.length})
              </div>
              {suggestions.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => handleSelectProduct(p)}
                  style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                >
                  <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{p.category} • {p.weight_size || '1 Kg'}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#be185d' }}>₹{p.price}</div>
                </div>
              ))}
            </div>
          ) : (
            /* Recent Searches List */
            <div style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={14} /> Recent Searches
                </span>
                <button onClick={clearRecentSearches} style={{ border: 'none', background: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(term);
                      saveRecentSearch(term);
                    }}
                    style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '12px', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
