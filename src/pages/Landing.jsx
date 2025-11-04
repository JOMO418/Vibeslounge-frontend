import React, { useState, useEffect } from 'react';

const Landing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Simulate API call - replace with actual API endpoint
    setTimeout(() => {
      setProducts([
        { _id: 1, name: 'Johnnie Walker Black', category: 'Whiskey', price: 3200, quantity: 15, description: 'Rich and smooth blended Scotch whisky' },
        { _id: 2, name: 'Hennessy VS', category: 'Cognac', price: 4500, quantity: 8, description: 'Premium French cognac' },
        { _id: 3, name: 'Bombay Sapphire', category: 'Gin', price: 2800, quantity: 20, description: 'London dry gin with botanicals' },
        { _id: 4, name: 'Grey Goose Vodka', category: 'Vodka', price: 3500, quantity: 12, description: 'Ultra-premium French vodka' },
        { _id: 5, name: 'Moët & Chandon', category: 'Champagne', price: 8500, quantity: 6, description: 'Luxurious French champagne' },
        { _id: 6, name: 'Patrón Silver', category: 'Tequila', price: 6200, quantity: 10, description: 'Premium 100% agave tequila' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const formatKES = (amount) => `KES ${amount.toLocaleString()}`;

  const handleStaffLogin = () => {
    window.location.href = '/login';
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl z-50 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Custom Logo */}
            <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="23" stroke="url(#gold-gradient)" strokeWidth="2"/>
              <path d="M25 10 L30 25 L25 40 L20 25 Z" fill="url(#gold-gradient)"/>
              <circle cx="25" cy="15" r="3" fill="#FFD700"/>
              <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700"/>
                  <stop offset="100%" stopColor="#FFA500"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="leading-tight">
              <h1 className="text-3xl font-serif italic font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Vibes
              </h1>
              <p className="text-sm font-sans font-light text-gray-300 tracking-widest -mt-1">LOUNGE</p>
            </div>
          </div>
          
          <button
            onClick={handleStaffLogin}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105"
          >
            Staff Login
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1920&h=1080&fit=crop&q=80"
            alt="Bar atmosphere"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
            Every mood deserves<br/>
            <span className="font-serif italic text-yellow-400">the right pour</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={handleStaffLogin}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
            >
              Staff Login
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:shadow-xl hover:shadow-yellow-500/50 transition-all transform hover:scale-105"
            >
              Explore Menu
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="relative py-32 px-6">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&h=1080&fit=crop&q=80"
            alt="Premium spirits"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-light text-white mb-6">
              Where <span className="font-serif italic text-yellow-400">Premium</span> Meets Perfection
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Curated selection of the world's finest spirits in the heart of Utawala, Nairobi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '✨', title: 'Elegance', desc: 'Sophisticated ambiance for discerning tastes' },
              { icon: '🥃', title: 'Variety', desc: 'Extensive collection of premium spirits' },
              { icon: '⭐', title: 'Quality', desc: '100% authentic products guaranteed' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all transform hover:scale-105">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-light text-white mb-4">
              Featured <span className="font-serif italic text-yellow-400">Collection</span>
            </h2>
            <p className="text-gray-400 text-lg">Handpicked spirits for the connoisseur</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-yellow-500/50 transition-all duration-500 transform hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-square overflow-hidden bg-black/40">
                    <img
                      src={`https://images.unsplash.com/photo-${
                        product.category === 'Whiskey' ? '1527281400683' :
                        product.category === 'Cognac' ? '1583487999-f24c93d9e9c5' :
                        product.category === 'Gin' ? '1551538827-9c037cb4f32a' :
                        product.category === 'Vodka' ? '1560508801-cf1a218a0d97' :
                        product.category === 'Champagne' ? '1547595628-c61a29b0a26d' :
                        '1569529465841'
                      }-1aae777175f8?w=500&h=500&fit=crop&q=80`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=500&fit=crop&q=80';
                      }}
                    />
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400">{product.category}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-400">
                        {formatKES(product.price)}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        product.quantity > 10 ? 'bg-green-500/20 text-green-400' :
                        product.quantity > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {product.quantity} left
                      </span>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-yellow-500/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none">
                  <circle cx="25" cy="25" r="23" stroke="url(#gold-gradient-footer)" strokeWidth="2"/>
                  <path d="M25 10 L30 25 L25 40 L20 25 Z" fill="url(#gold-gradient-footer)"/>
                  <circle cx="25" cy="15" r="3" fill="#FFD700"/>
                  <defs>
                    <linearGradient id="gold-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700"/>
                      <stop offset="100%" stopColor="#FFA500"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <p className="text-2xl font-serif italic font-bold text-yellow-400">Vibes</p>
                  <p className="text-xs text-gray-400 tracking-widest">LOUNGE</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Utawala's premier destination for premium spirits</p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('home')} className="block text-gray-400 hover:text-yellow-400 transition">Home</button>
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-yellow-400 transition">About</button>
                <button onClick={() => scrollToSection('products')} className="block text-gray-400 hover:text-yellow-400 transition">Products</button>
                <button onClick={handleStaffLogin} className="block text-gray-400 hover:text-yellow-400 transition">Staff Login</button>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>📍 Utawala, Nairobi, Kenya</p>
                <p>📞 +254 700 000 000</p>
                <p>✉️ info@vibeslounge.co.ke</p>
                <p>🕐 Mon-Sun: 10AM - 11PM</p>
              </div>
            </div>
          </div>

          <div className="border-t border-yellow-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2025 Vibes Lounge. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Powered by</span>
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#jomo-gradient)" />
                  <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="url(#jomo-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="jomo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700"/>
                      <stop offset="100%" stopColor="#FFA500"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Jomo Software Solutions
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-500/30 rounded-3xl max-w-2xl w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl transition"
            >
              ×
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square rounded-2xl overflow-hidden bg-black/40">
                <img
                  src={`https://images.unsplash.com/photo-${
                    selectedProduct.category === 'Whiskey' ? '1527281400683' :
                    selectedProduct.category === 'Cognac' ? '1583487999-f24c93d9e9c5' :
                    selectedProduct.category === 'Gin' ? '1551538827-9c037cb4f32a' :
                    selectedProduct.category === 'Vodka' ? '1560508801-cf1a218a0d97' :
                    selectedProduct.category === 'Champagne' ? '1547595628-c61a29b0a26d' :
                    '1569529465841'
                  }-1aae777175f8?w=500&h=500&fit=crop&q=80`}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-400">{selectedProduct.category}</p>
                </div>

                <p className="text-gray-300 leading-relaxed">{selectedProduct.description}</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-gray-400">Price</span>
                    <span className="text-2xl font-bold text-yellow-400">{formatKES(selectedProduct.price)}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-gray-400">Stock</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedProduct.quantity > 10 ? 'bg-green-500/20 text-green-400' :
                      selectedProduct.quantity > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedProduct.quantity} units available
                    </span>
                  </div>
                </div>

                <button className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:shadow-xl hover:shadow-yellow-500/50 transition-all transform hover:scale-105">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;