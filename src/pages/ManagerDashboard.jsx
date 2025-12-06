import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import socketService from '../services/socketService';
import { salesService } from '../services/salesService';
import { productService } from '../services/productService';
import { tabService } from '../services/tabService';
import { ShoppingCart, LogOut, Loader2, Plus, DollarSign, X, Minus, Edit, Trash2 } from 'lucide-react';
import ProfitCard from '../components/ProfitCard';

const formatKES = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount || 0);
const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [todaysProfit, setTodaysProfit] = useState(0);
  const [todaysRevenue, setTodaysRevenue] = useState(0);
  const [todaysTransactions, setTodaysTransactions] = useState(0);
  const [mySales, setMySales] = useState([]);
  const [salesStats, setSalesStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [showAddTab, setShowAddTab] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newTab, setNewTab] = useState({ customerName: '', customerPhone: '', productName: '', quantity: 1, amountOwed: '', notes: '' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAmounts, setPaymentAmounts] = useState({ cash: '', mpesa: '' });
  
  // Added missing state variables for product management
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    costPrice: '',
    quantity: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    setupSocketListeners();
    const interval = setInterval(fetchData, 60000);
    return () => { 
      clearInterval(interval); 
      socketService.removeAllListeners(); 
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [profitRes, salesRes, productsRes, tabsRes] = await Promise.all([
        salesService.getTodayProfit(),
        salesService.getMySalesToday(),
        productService.getAll(),
        tabService.getAll()
      ]);

      if (profitRes.data) {
        setTodaysProfit(profitRes.data.todayProfit || 0);
        setTodaysRevenue(profitRes.data.todayRevenue || 0);
        setTodaysTransactions(profitRes.data.todayTransactions || 0);
      }

      if (salesRes.data) {
        setMySales(salesRes.data.sales || []);
        setSalesStats(salesRes.data.stats || null);
      }

      setProducts(productsRes.data?.products || productsRes.data || []);
      setTabs(tabsRes.data?.tabs || tabsRes.data || []);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 404) {
        toast.error('Backend routes not found. Check your server configuration.');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.connect();
    
    socketService.onSaleCreated(() => { 
      fetchData(); 
      toast.success('New sale recorded!'); 
    });
    
    socketService.onProfitUpdated((data) => {
      if (data.todayProfit !== undefined) {
        setTodaysProfit(data.todayProfit);
      }
      if (data.todayRevenue !== undefined) {
        setTodaysRevenue(data.todayRevenue);
      }
    });
    
    socketService.onStockUpdated(() => fetchData());
    socketService.onTabCreated(() => fetchData());
    socketService.onTabUpdated(() => fetchData());
  };

  const handleLogout = () => { 
    socketService.disconnect();
    logout(); 
    navigate('/login'); 
    toast.success('Logged out successfully'); 
  };

  // Added missing product management handlers
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Adding product...');
    try {
      await productService.create(productForm);
      toast.success('Product added successfully!', { id: loadingToast });
      setAddProductModalOpen(false);
      setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      costPrice: product.costPrice.toString(),
      quantity: product.quantity.toString(),
      description: product.description || ''
    });
    setEditProductModalOpen(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Updating product...');
    try {
      await productService.update(selectedProduct._id, productForm);
      toast.success('Product updated successfully!', { id: loadingToast });
      setEditProductModalOpen(false);
      setSelectedProduct(null);
      setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return;
    const loadingToast = toast.loading('Deleting product...');
    try {
      await productService.delete(productId);
      toast.success('Product deleted successfully', { id: loadingToast });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product', { id: loadingToast });
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      updateCartQuantity(product._id, existingItem.cartQuantity + quantity);
    } else {
      setCart([...cart, { ...product, cartQuantity: quantity }]);
      toast.success(`${product.name} added to cart`);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    const product = products.find(p => p._id === productId);
    if (newQuantity > product.quantity) { 
      toast.error(`Only ${product.quantity} units available`); 
      return; 
    }
    if (newQuantity <= 0) { 
      removeFromCart(productId); 
      return; 
    }
    setCart(cart.map(item => item._id === productId ? { ...item, cartQuantity: newQuantity } : item));
  };

  const removeFromCart = (productId) => setCart(cart.filter(item => item._id !== productId));
  
  const clearCart = () => { 
    setCart([]); 
    setPaymentAmounts({ cash: '', mpesa: '' }); 
  };
  
  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCompleteSale = async () => {
    if (cart.length === 0) { 
      toast.error('Cart is empty'); 
      return; 
    }
    
    const cashAmt = parseFloat(paymentAmounts.cash) || 0;
    const mpesaAmt = parseFloat(paymentAmounts.mpesa) || 0;
    const total = calculateTotal();
    
    if (Math.abs((cashAmt + mpesaAmt) - total) > 0.01) {
      toast.error(`Payment mismatch! Total: ${formatKES(total)}, Paid: ${formatKES(cashAmt + mpesaAmt)}`);
      return;
    }
    
    if (cashAmt === 0 && mpesaAmt === 0) {
      toast.error('Please enter payment amounts');
      return;
    }
    
    setLoading(true);
    const loadingToast = toast.loading('Processing sale...');
    try {
      await salesService.createSale({ 
        items: cart.map(item => ({ productId: item._id, quantity: item.cartQuantity })), 
        paymentMethods: { cash: cashAmt, mpesa: mpesaAmt }
      });
      toast.success(`Sale completed! ${formatKES(total)}`, { id: loadingToast });
      setSaleModalOpen(false); 
      clearCart(); 
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete sale', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTab = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Recording tab...');
    try {
      await tabService.create(newTab);
      toast.success('Tab recorded successfully!', { id: loadingToast });
      setShowAddTab(false);
      setNewTab({ customerName: '', customerPhone: '', productName: '', quantity: 1, amountOwed: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record tab', { id: loadingToast });
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Recording payment...');
    try {
      await tabService.recordPayment(selectedTab._id, { amountPaid: parseFloat(paymentAmount) });
      toast.success('Payment recorded successfully!', { id: loadingToast });
      setShowPaymentModal(false); 
      setSelectedTab(null); 
      setPaymentAmount(''); 
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment', { id: loadingToast });
    }
  };

  const handleDeleteTab = async (tabId, customerName) => {
    if (window.confirm(`Delete tab for ${customerName}?`)) {
      const loadingToast = toast.loading('Deleting tab...');
      try {
        await tabService.delete(tabId);
        toast.success('Tab deleted successfully!', { id: loadingToast });
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete tab', { id: loadingToast });
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <header className=" z-50 bg-[#1a1a1a] border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Manager Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-400">{user?.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ProfitCard todaysProfit={todaysProfit} />
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition text-sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Make a Sale Button */}
        <button onClick={() => setSaleModalOpen(true)} className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg sm:text-xl py-5 sm:py-6 px-6 sm:px-8 rounded-lg transition shadow-lg">
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
          Make a Sale
        </button>

          {/* Inventory Table */}
          <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>Inventory Management</h2>
            <button 
              onClick={() => setAddProductModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition"
              style={{ backgroundColor: 'hsl(45 93% 47%)', color: 'hsl(0 0% 0%)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(45 93% 42%)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(45 93% 47%)'}
            >
              + Add New Product
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'hsl(45 93% 47%)' }} />
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead style={{ backgroundColor: 'hsl(0 0% 10%)' }}>
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Product Name</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Category</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Price</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Stock</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Status</th>
                    <th className="text-center py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product, idx) => (
                    <tr 
                      key={product._id} 
                      className="transition"
                      style={{ 
                        backgroundColor: idx % 2 === 0 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 10% / 0.5)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(0 0% 15%)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 10% / 0.5)'}
                    >
                      <td className="py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>{product.name}</td>
                      <td className="py-3 px-4">
                        <span 
                          className="text-xs px-2 py-1 rounded-full capitalize"
                          style={{ backgroundColor: 'hsl(0 0% 20%)', color: 'hsl(0 0% 54%)' }}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'hsl(45 93% 47%)' }}>{formatKES(product.price)}</td>
                      <td className="py-3 px-4">
                        <span 
                          className="font-semibold"
                          style={{ 
                            color: product.quantity < 5 ? 'hsl(0 84% 60%)' : 
                                   product.quantity <= 10 ? 'hsl(38 92% 50%)' : 
                                   'hsl(142 71% 45%)'
                          }}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {product.quantity > 10 ? (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(142 71% 45% / 0.2)', color: 'hsl(142 71% 45%)' }}>Available</span>
                        ) : product.quantity >= 5 ? (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(38 92% 50% / 0.2)', color: 'hsl(38 92% 50%)' }}>Low Stock</span>
                        ) : product.quantity > 0 ? (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(0 84% 60% / 0.2)', color: 'hsl(0 84% 60%)' }}>Critical</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(0 84% 60% / 0.2)', color: 'hsl(0 84% 60%)' }}>Out of Stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 rounded-lg transition inline-flex items-center justify-center"
                            style={{ backgroundColor: 'transparent', border: '1px solid hsl(45 93% 47% / 0.3)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(45 93% 47% / 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" style={{ color: 'hsl(45 93% 47%)' }} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-2 rounded-lg transition inline-flex items-center justify-center"
                            style={{ backgroundColor: 'transparent', border: '1px solid hsl(0 84% 60% / 0.3)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(0 84% 60% / 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" style={{ color: 'hsl(0 84% 60%)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div> {/* End overflow-x-auto */}
        </div>
          )}
        </div>

        {/* My Sales Today */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3">My Recent Sales Today</h2>
          {mySales.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No sales recorded yet today. Make your first sale!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Time</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Product</th>
                    <th className="text-center py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Qty</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Payment</th>
                    <th className="text-right py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Total</th>
                    <th className="text-right py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {mySales.map((sale, idx) => {
                    // Determine payment method display
                    const cashAmt = sale.paymentMethods?.cash || 0;
                    const mpesaAmt = sale.paymentMethods?.mpesa || 0;
                    let paymentDisplay = 'UNKNOWN';
                    let paymentClass = 'bg-gray-500/20 text-gray-400';
                    
                    if (cashAmt > 0 && mpesaAmt > 0) {
                      paymentDisplay = 'SPLIT';
                      paymentClass = 'bg-blue-500/20 text-blue-400';
                    } else if (cashAmt > 0) {
                      paymentDisplay = 'CASH';
                      paymentClass = 'bg-green-500/20 text-green-400';
                    } else if (mpesaAmt > 0) {
                      paymentDisplay = 'M-PESA';
                      paymentClass = 'bg-green-600/20 text-green-500';
                    }
                    
                    return (
                      <tr key={sale._id} className={idx % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-gray-900/50'}>
                        <td className="py-3 px-4 text-xs sm:text-sm text-gray-400">{formatTime(sale.createdAt)}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm font-semibold">{sale.productName}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-center">{sale.quantitySold}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${paymentClass}`}>
                            {paymentDisplay}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-right font-semibold">{formatKES(sale.totalPrice)}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-right font-bold text-green-400">{formatKES(sale.profit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-900 border-t-2 border-gray-700">
                  <tr>
                    <td colSpan="4" className="py-3 px-4 text-xs sm:text-sm font-bold text-gray-300 text-right">TOTALS:</td>
                    <td className="py-3 px-4 text-xs sm:text-sm font-bold text-white text-right">{formatKES(mySales.reduce((sum, s) => sum + s.totalPrice, 0))}</td>
                    <td className="py-3 px-4 text-xs sm:text-sm font-bold text-green-400 text-right">{formatKES(mySales.reduce((sum, s) => sum + s.profit, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Customer Tabs */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Customer Tabs</h2>
              <p className="text-xs sm:text-sm text-gray-400">Track credit & payments</p>
            </div>
            <button onClick={() => setShowAddTab(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-[#c9a532] transition text-sm">
              <Plus className="h-4 w-4" />
              New Tab
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <div className="bg-gray-900 p-3 sm:p-4 rounded-lg border border-red-500/30">
              <p className="text-xs text-gray-400 mb-1">Total Outstanding</p>
              <p className="text-xl sm:text-2xl font-bold text-red-500">
                {formatKES(tabs.filter(t => t.status !== 'paid').reduce((sum, t) => sum + (t.amountOwed - t.amountPaid), 0))}
              </p>
            </div>
            <div className="bg-gray-900 p-3 sm:p-4 rounded-lg border border-green-500/30">
              <p className="text-xs text-gray-400 mb-1">Paid Today</p>
              <p className="text-xl sm:text-2xl font-bold text-green-500">
                {formatKES(tabs.filter(t => new Date(t.updatedAt).toDateString() === new Date().toDateString() && t.amountPaid > 0).reduce((sum, t) => sum + t.amountPaid, 0))}
              </p>
            </div>
            <div className="bg-gray-900 p-3 sm:p-4 rounded-lg border border-[#D4AF37]/30">
              <p className="text-xs text-gray-400 mb-1">Active Customers</p>
              <p className="text-xl sm:text-2xl font-bold text-[#D4AF37]">{tabs.filter(t => t.status !== 'paid').length}</p>
            </div>
          </div>

          {/* Tabs Table */}
          {tabs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No customer tabs recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Items</th>
                    <th className="text-right py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Balance</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Status</th>
                    <th className="text-center py-3 px-4 text-xs sm:text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tabs.map((tab, idx) => {
                    const balance = tab.amountOwed - tab.amountPaid;
                    return (
                      <tr key={tab._id} className={`${idx % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-gray-900/50'} border-l-4 ${tab.status === 'unpaid' ? 'border-red-500' : tab.status === 'partially_paid' ? 'border-yellow-500' : 'border-green-500'}`}>
                        <td className="py-3 px-4 text-xs sm:text-sm font-semibold">{tab.customerName}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-gray-400">{tab.productName}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-right font-bold text-[#D4AF37]">{formatKES(balance)}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${tab.status === 'unpaid' ? 'bg-red-500/20 text-red-400' : tab.status === 'partially_paid' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                            {tab.status === 'unpaid' ? 'UNPAID' : tab.status === 'partially_paid' ? 'PARTIAL' : 'PAID'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            {tab.status !== 'paid' && (
                              <button onClick={() => { setSelectedTab(tab); setShowPaymentModal(true); }} className="text-green-500 hover:text-green-400" title="Record Payment">
                                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            )}
                            <button onClick={() => handleDeleteTab(tab._id, tab.customerName)} className="text-red-500 hover:text-red-400 text-lg" title="Delete">×</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Sale Modal */}
      {saleModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-lg max-w-6xl w-full border border-gray-800 my-8">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold">Make a Sale</h2>
              <button onClick={() => { setSaleModalOpen(false); clearCart(); }} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Selection */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Select Products</h3>
                  <div className="mb-4 space-y-2">
                    <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-4 py-2 bg-gray-900 border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]">
                      <option value="all">All Categories</option>
                      {categories.map(cat => (<option key={cat} value={cat} className="capitalize">{cat}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div key={product._id} onClick={() => product.quantity > 0 && addToCart(product)} className={`p-3 bg-gray-900 rounded-lg border cursor-pointer transition ${product.quantity > 0 ? 'border-gray-700 hover:border-[#D4AF37]' : 'border-red-500/30 opacity-50 cursor-not-allowed'}`}>
                        <p className="font-semibold text-xs sm:text-sm mb-1 truncate">{product.name}</p>
                        <p className="text-[#D4AF37] font-bold text-xs sm:text-sm">{formatKES(product.price)}</p>
                        <p className={`text-xs ${product.quantity > 0 ? 'text-gray-400' : 'text-red-400'}`}>Stock: {product.quantity}</p>
                        <div className="flex gap-1 mt-2">
                          <button onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }} disabled={product.quantity === 0} className="flex-1 bg-[#D4AF37] text-black text-xs py-1 rounded hover:bg-[#c9a532] disabled:opacity-50">+1</button>
                          <button onClick={(e) => { e.stopPropagation(); addToCart(product, 6); }} disabled={product.quantity < 6} className="flex-1 bg-gray-700 text-white text-xs py-1 rounded hover:bg-gray-600 disabled:opacity-50">+6</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Shopping Cart */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Current Sale</h3>
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">Cart is empty</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {cart.map(item => (
                        <div key={item._id} className="bg-black rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm">{item.name}</span>
                            <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-400"><X className="h-4 w-4" /></button>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{formatKES(item.price)} each</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => updateCartQuantity(item._id, item.cartQuantity - 1)} className="bg-gray-700 text-white w-8 h-8 rounded hover:bg-gray-600 flex items-center justify-center"><Minus className="h-4 w-4" /></button>
                              <span className="font-bold w-8 text-center">{item.cartQuantity}</span>
                              <button onClick={() => updateCartQuantity(item._id, item.cartQuantity + 1)} className="bg-gray-700 text-white w-8 h-8 rounded hover:bg-gray-600 flex items-center justify-center"><Plus className="h-4 w-4" /></button>
                            </div>
                            <span className="text-[#D4AF37] font-bold text-sm">{formatKES(item.price * item.cartQuantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {cart.length > 0 && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Payment Details *</label>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">💵 Cash Amount</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={paymentAmounts.cash}
                              onChange={(e) => setPaymentAmounts({...paymentAmounts, cash: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">📱 M-PESA Amount</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={paymentAmounts.mpesa}
                              onChange={(e) => setPaymentAmounts({...paymentAmounts, mpesa: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                              placeholder="0"
                            />
                          </div>
                          <div className="bg-gray-800 p-2 rounded text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Cart Total:</span>
                              <span className="text-[#D4AF37] font-bold">{formatKES(calculateTotal())}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Paying:</span>
                              <span className={`font-bold ${Math.abs(((parseFloat(paymentAmounts.cash) || 0) + (parseFloat(paymentAmounts.mpesa) || 0)) - calculateTotal()) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatKES((parseFloat(paymentAmounts.cash) || 0) + (parseFloat(paymentAmounts.mpesa) || 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={handleCompleteSale} 
                        disabled={loading || ((parseFloat(paymentAmounts.cash) || 0) === 0 && (parseFloat(paymentAmounts.mpesa) || 0) === 0)} 
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition text-base sm:text-lg flex items-center justify-center gap-2"
                      >
                        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</> : '✓ Complete Sale'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tab Modal */}
      {showAddTab && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800">
              <h2 className="text-lg sm:text-xl font-bold">Record New Customer Tab</h2>
              <button onClick={() => setShowAddTab(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAddTab} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Customer Name *</label>
                <input type="text" value={newTab.customerName} onChange={(e) => setNewTab({...newTab, customerName: e.target.value})} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number (Optional)</label>
                <input type="tel" value={newTab.customerPhone} onChange={(e) => setNewTab({...newTab, customerPhone: e.target.value})} placeholder="+254..." className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Product/Items *</label>
                <input type="text" value={newTab.productName} onChange={(e) => setNewTab({...newTab, productName: e.target.value})} placeholder="e.g., 2x Tusker, 1x Chrome Vodka" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Quantity *</label>
                  <input type="number" min="1" value={newTab.quantity} onChange={(e) => setNewTab({...newTab, quantity: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Amount Owed (KES) *</label>
                  <input type="number" min="0" step="0.01" value={newTab.amountOwed} onChange={(e) => setNewTab({...newTab, amountOwed: e.target.value})} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Notes (Optional)</label>
                <textarea value={newTab.notes} onChange={(e) => setNewTab({...newTab, notes: e.target.value})} maxLength="200" rows="2" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="Any additional notes..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddTab(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-[#D4AF37] hover:bg-[#c9a532] text-black font-semibold py-3 rounded-lg transition text-sm">Record Tab</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedTab && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800">
              <h2 className="text-lg sm:text-xl font-bold">Record Payment</h2>
              <button onClick={() => { setShowPaymentModal(false); setSelectedTab(null); setPaymentAmount(''); }} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-4 sm:p-6 space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg space-y-2">
                <div className="flex justify-between"><span className="text-gray-400 text-sm">Customer:</span><span className="font-semibold text-sm">{selectedTab.customerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-sm">Total Owed:</span><span className="text-red-400 font-semibold text-sm">{formatKES(selectedTab.amountOwed)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-sm">Already Paid:</span><span className="text-green-400 font-semibold text-sm">{formatKES(selectedTab.amountPaid)}</span></div>
                <div className="flex justify-between border-t border-gray-700 pt-2"><span className="text-gray-400 font-bold text-sm">Remaining Balance:</span><span className="text-[#D4AF37] font-bold text-base">{formatKES(selectedTab.amountOwed - selectedTab.amountPaid)}</span></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Payment Amount (KES) *</label>
                <input type="number" min="0" step="0.01" max={selectedTab.amountOwed - selectedTab.amountPaid} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="Enter amount received" required />
                <p className="text-xs text-gray-500 mt-1">Maximum: {formatKES(selectedTab.amountOwed - selectedTab.amountPaid)}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedTab(null); setPaymentAmount(''); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"><DollarSign className="h-4 w-4" /> Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
       {/* Add Product Modal */}
       {addProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="max-w-md w-full rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid hsl(0 0% 17%)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>Add New Product</h2>
              <button 
                onClick={() => { 
                  setAddProductModalOpen(false); 
                  setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' }); 
                }} 
                className="text-3xl leading-none hover:opacity-70 transition" 
                style={{ color: 'hsl(0 0% 54%)' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Product Name *</label>
                <input 
                  type="text" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Category *</label>
                <select 
                  value={productForm.category} 
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  required
                >
                  <option value="">Select Category</option>
                  <option value="vodka">Vodka</option>
                  <option value="whiskey">Whiskey</option>
                  <option value="rum">Rum</option>
                  <option value="gin">Gin</option>
                  <option value="beer">Beer</option>
                  <option value="cider">Cider</option>
                  <option value="wine">Wine</option>
                  <option value="spirits">Spirits</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Selling Price *</label>
                  <input 
                    type="number" 
                    value={productForm.price} 
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg text-sm" 
                    style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                    placeholder="KES" 
                    min="0"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Cost Price *</label>
                  <input 
                    type="number" 
                    value={productForm.costPrice} 
                    onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg text-sm" 
                    style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                    placeholder="KES" 
                    min="0"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Initial Quantity *</label>
                <input 
                  type="number" 
                  value={productForm.quantity} 
                  onChange={(e) => setProductForm({...productForm, quantity: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  placeholder="Units" 
                  min="0"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Description</label>
                <textarea 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  rows="3"
                  placeholder="Optional product description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { 
                    setAddProductModalOpen(false); 
                    setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' }); 
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition"
                  style={{ backgroundColor: 'transparent', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(0 0% 15%)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'hsl(45 93% 47%)', color: 'hsl(0 0% 0%)', opacity: submitting ? 0.7 : 1 }}
                  onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = 'hsl(45 93% 42%)')}
                  onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = 'hsl(45 93% 47%)')}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Edit Product Modal */}
{editProductModalOpen && selectedProduct && (
  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
    <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full border border-gray-800">
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800">
        <h2 className="text-lg sm:text-xl font-bold">Edit Product</h2>
        <button 
          onClick={() => { 
            setEditProductModalOpen(false); 
            setSelectedProduct(null);
            setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' }); 
          }} 
          className="text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleEditProduct} className="p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Product Name *</label>
          <input 
            type="text" 
            value={productForm.name} 
            onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
          <select 
            value={productForm.category} 
            onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" 
            required
          >
            <option value="">Select Category</option>
            <option value="vodka">Vodka</option>
            <option value="whiskey">Whiskey</option>
            <option value="rum">Rum</option>
            <option value="gin">Gin</option>
            <option value="beer">Beer</option>
            <option value="cider">Cider</option>
            <option value="wine">Wine</option>
            <option value="spirits">Spirits</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Selling Price *</label>
            <input 
              type="number" 
              value={productForm.price} 
              onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" 
              placeholder="KES" 
              min="0"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Cost Price *</label>
            <input 
              type="number" 
              value={productForm.costPrice} 
              onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} 
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" 
              placeholder="KES" 
              min="0"
              required 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Quantity *</label>
          <input 
            type="number" 
            value={productForm.quantity} 
            onChange={(e) => setProductForm({...productForm, quantity: e.target.value})} 
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" 
            placeholder="Units" 
            min="0"
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
          <textarea 
            value={productForm.description} 
            onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37]" 
            rows="3"
            placeholder="Optional product description..."
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button 
            type="button"
            onClick={() => { 
              setEditProductModalOpen(false); 
              setSelectedProduct(null);
              setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' }); 
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#D4AF37] hover:bg-[#c9a532] text-black font-semibold py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Product'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default ManagerDashboard;
//fial