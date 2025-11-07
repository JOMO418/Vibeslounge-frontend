import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatKES } from "../utils/currency";
import toast from "react-hot-toast";
import { Loader2, LogOut, TrendingUp, DollarSign, ShoppingCart, Package, Download, Trash2, UserPlus, Edit, X, RefreshCw, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socketService";
import { salesService } from "../services/salesService";
import { productService } from "../services/productService";
import { authService } from "../services/authService";
import ProfitCard from '../components/ProfitCard'; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [todaysProfit, setTodaysProfit] = useState(0);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [editStaffModalOpen, setEditStaffModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    costPrice: '',
    quantity: '',
    description: ''
  });
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    role: 'manager'
  });
  const [editStaffForm, setEditStaffForm] = useState({
    email: '',
    password: '',
    role: 'manager'
  });
  const [submitting, setSubmitting] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    calculateTodaysProfit();
    const interval = setInterval(() => {
      calculateTodaysProfit();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateTodaysProfit = async () => {
    try {
      const { data } = await salesService.getTodayProfit();
      setTodaysProfit(data?.todayProfit || 0);
    } catch (error) {
      console.error('Error calculating profit:', error);
    }
  };

  useEffect(() => {
    socketService.connect();
    
    socketService.onSaleCreated(() => {
      calculateTodaysProfit();
      refetchStats();
      refetchAllSales();
    });

    socketService.onProfitUpdated((data) => {
      setTodaysProfit(data.todayProfit);
    });

    socketService.onProductUpdated(() => {
      refetchProducts();
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success("Logged out successfully");
  };

  const { data: todayStats, refetch: refetchStats } = useQuery({
    queryKey: ['todayStats'],
    queryFn: async () => {
      const { data } = await salesService.getTodayProfit();
      return {
        revenue: data?.todayRevenue || 0,
        transactions: data?.todayTransactions || 0,
        itemsSold: 0
      };
    },
  });

  const { data: lowStock } = useQuery({
    queryKey: ['lowStock'],
    queryFn: async () => {
      const { data } = await productService.getLowStock();
      return data?.products || [];
    },
  });

  const { data: products, isLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await productService.getAll();
      return data?.products || [];
    },
  });

  const { data: allSales, refetch: refetchAllSales } = useQuery({
    queryKey: ['allSales', dateFilter, paymentFilter, searchTerm],
    queryFn: async () => {
      const filters = {
        dateFilter,
        paymentMethod: paymentFilter !== 'all' ? paymentFilter : undefined,
        search: searchTerm || undefined
      };
      const { data } = await salesService.getAllSales(filters);
      return data?.sales || [];
    },
  });

  const { data: staffMembers, refetch: refetchStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      try {
        const { data } = await authService.getAllUsers();
        return data?.users || [];
      } catch (error) {
        console.error('Error fetching staff:', error);
        return [];
      }
    },
  });

  // ==================== PRODUCT HANDLERS ====================
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Adding product...');
    try {
      await productService.create(productForm);
      toast.success('Product added successfully!', { id: loadingToast });
      setAddProductModalOpen(false);
      setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' });
      refetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
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
      refetchProducts();
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
      refetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product', { id: loadingToast });
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

  // ==================== STAFF HANDLERS ====================
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Adding staff member...');
    try {
      await authService.register(staffForm);
      toast.success('Staff member added successfully!', { id: loadingToast });
      setAddStaffModalOpen(false);
      setStaffForm({ email: '', password: '', role: 'manager' });
      refetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add staff member', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditStaffModal = (staff) => {
    setSelectedStaff(staff);
    setEditStaffForm({
      email: staff.email,
      password: '', // Leave empty for security
      role: staff.role
    });
    setEditStaffModalOpen(true);
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Updating staff member...');
    try {
      await authService.updateUser(selectedStaff._id, editStaffForm);
      toast.success('Staff member updated successfully!', { id: loadingToast });
      setEditStaffModalOpen(false);
      setSelectedStaff(null);
      setEditStaffForm({ email: '', password: '', role: 'manager' });
      refetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff member', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (userId, staffEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${staffEmail}"? This action cannot be undone.`)) return;
    const loadingToast = toast.loading('Deleting staff member...');
    try {
      await authService.deleteUser(userId);
      toast.success('Staff member deleted successfully', { id: loadingToast });
      refetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff member', { id: loadingToast });
    }
  };

  // ==================== TRANSACTION HANDLERS ====================
  const handleDeleteTransaction = async (saleId, sale) => {
    const confirmMessage = `Delete this transaction?\n\nProduct: ${sale.productName}\nQuantity: ${sale.quantitySold}\nAmount: ${formatKES(sale.totalPrice)}\n\n⚠️ This will return ${sale.quantitySold} unit(s) back to stock.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    const loadingToast = toast.loading('Reversing transaction...');
    try {
      await salesService.deleteSale(saleId);
      toast.success(`Transaction deleted! ${sale.quantitySold} unit(s) returned to stock.`, { id: loadingToast });
      refetchAllSales();
      refetchProducts();
      refetchStats();
      calculateTodaysProfit();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction', { id: loadingToast });
    }
  };

  const exportToCSV = () => {
    if (!allSales || allSales.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = ['Date & Time', 'Product', 'Quantity', 'Payment', 'Total', 'Profit', 'Sold By'];
    const rows = allSales.map(sale => [
      new Date(sale.createdAt).toLocaleString(),
      sale.productName,
      sale.quantitySold,
      sale.paymentMethod,
      sale.totalPrice,
      sale.profit,
      `${sale.soldBy?.email || 'N/A'} (${sale.soldByRole})`
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully!');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(0 0% 4%)' }}>
      {/* Top Bar */}
      <header
  className="px-6 py-4"
  style={{
    backgroundColor: 'hsl(0 0% 10%)',
    borderBottom: '1px solid hsl(0 0% 17%)',
  }}
>
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>
        Admin Dashboard
      </h1>
      <p className="text-sm" style={{ color: 'hsl(0 0% 54%)' }}>
        {user?.email}
      </p>
    </div>

    <ProfitCard todaysProfit={todaysProfit} />

    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
      style={{
        border: '1px solid hsl(0 0% 17%)',
        backgroundColor: 'transparent',
        color: 'hsl(0 0% 98%)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = 'hsl(0 0% 15%)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  </div>
</header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(45 93% 47% / 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8" style={{ color: 'hsl(45 93% 47%)' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'hsl(45 93% 47%)' }}>{formatKES(todayStats?.revenue || 0)}</p>
            <p className="text-sm mt-1" style={{ color: 'hsl(0 0% 54%)' }}>Total Sales Today</p>
          </div>

          <div className="p-6 rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(45 93% 47% / 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="h-8 w-8" style={{ color: 'hsl(45 93% 47%)' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'hsl(45 93% 47%)' }}>{todayStats?.transactions || 0}</p>
            <p className="text-sm mt-1" style={{ color: 'hsl(0 0% 54%)' }}>Transactions Completed</p>
          </div>

          <div className="p-6 rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(45 93% 47% / 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8" style={{ color: 'hsl(45 93% 47%)' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'hsl(45 93% 47%)' }}>{allSales?.reduce((sum, s) => sum + s.quantitySold, 0) || 0}</p>
            <p className="text-sm mt-1" style={{ color: 'hsl(0 0% 54%)' }}>Units Sold Today</p>
          </div>

          <div 
            className="p-6 rounded-lg" 
            style={{ 
              backgroundColor: 'hsl(0 0% 10%)', 
              border: (lowStock?.length || 0) > 0 ? '1px solid hsl(0 84% 60% / 0.3)' : '1px solid hsl(142 71% 45% / 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8" style={{ color: 'hsl(45 93% 47%)' }} />
            </div>
            <p 
              className="text-3xl font-bold" 
              style={{ color: (lowStock?.length || 0) > 0 ? 'hsl(0 84% 60%)' : 'hsl(142 71% 45%)' }}
            >
              {lowStock?.length || 0}
            </p>
            <p className="text-sm mt-1" style={{ color: 'hsl(0 0% 54%)' }}>Low Stock Items</p>
          </div>
        </div>

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

        {/* All Transactions Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>All Transactions</h2>
              <p className="text-sm" style={{ color: 'hsl(0 0% 54%)' }}>View and manage sales history</p>
            </div>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition"
              style={{ backgroundColor: 'hsl(142 71% 45%)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(142 71% 40%)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(142 71% 45%)'}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 54%)' }}>Date Filter</label>
                <select 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: 'hsl(0 0% 6%)', 
                    border: '1px solid hsl(0 0% 17%)', 
                    color: 'hsl(0 0% 98%)',
                    outline: 'none'
                  }}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 54%)' }}>Payment Method</label>
                <select 
                  value={paymentFilter} 
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: 'hsl(0 0% 6%)', 
                    border: '1px solid hsl(0 0% 17%)', 
                    color: 'hsl(0 0% 98%)',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash Only</option>
                  <option value="mpesa">M-Pesa Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 54%)' }}>Search Product</label>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product name..."
                  className="w-full px-4 py-2 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: 'hsl(0 0% 6%)', 
                    border: '1px solid hsl(0 0% 17%)', 
                    color: 'hsl(0 0% 98%)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          {!allSales || allSales.length === 0 ? (
            <div className="text-center py-8 rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 54%)' }}>
              No transactions found for the selected filters
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'hsl(0 0% 10%)' }}>
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Date & Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Product</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Qty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Payment</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Total</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Profit</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Sold By</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSales.map((sale, idx) => (
                      <tr key={sale._id} style={{ backgroundColor: idx % 2 === 0 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 10% / 0.5)' }}>
                        <td className="py-3 px-4 text-sm" style={{ color: 'hsl(0 0% 54%)' }}>
                          {new Date(sale.createdAt).toLocaleString('en-KE', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>{sale.productName}</td>
                        <td className="py-3 px-4 text-sm text-center" style={{ color: 'hsl(0 0% 98%)' }}>{sale.quantitySold}</td>
                        <td className="py-3 px-4">
                          <span 
                            className="text-xs px-2 py-1 rounded-full uppercase"
                            style={{ 
                              backgroundColor: sale.paymentMethod === 'cash' ? 'hsl(142 71% 45% / 0.2)' : 'hsl(142 76% 40% / 0.2)',
                              color: sale.paymentMethod === 'cash' ? 'hsl(142 71% 45%)' : 'hsl(142 76% 40%)'
                            }}
                          >
                            {sale.paymentMethod === 'cash' ? 'CASH' : 'M-PESA'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: 'hsl(45 93% 47%)' }}>{formatKES(sale.totalPrice)}</td>
                        <td className="py-3 px-4 text-sm text-right font-bold" style={{ color: 'hsl(142 71% 45%)' }}>+{formatKES(sale.profit)}</td>
                        <td className="py-3 px-4 text-sm" style={{ color: 'hsl(0 0% 54%)' }}>
                          {sale.soldBy?.email || 'N/A'}
                          <span 
                            className="ml-2 text-xs px-2 py-1 rounded-full capitalize"
                            style={{ 
                              backgroundColor: sale.soldByRole === 'admin' ? 'hsl(45 93% 47% / 0.2)' : 'hsl(217 91% 60% / 0.2)',
                              color: sale.soldByRole === 'admin' ? 'hsl(45 93% 47%)' : 'hsl(217 91% 60%)'
                            }}
                          >
                            {sale.soldByRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => handleDeleteTransaction(sale._id, sale)}
                            className="p-2 rounded-lg transition inline-flex items-center justify-center"
                            style={{ backgroundColor: 'transparent', border: '1px solid hsl(0 84% 60% / 0.3)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(0 84% 60% / 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Delete & Reverse Transaction"
                          >
                            <Trash2 className="h-4 w-4" style={{ color: 'hsl(0 84% 60%)' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ backgroundColor: 'hsl(0 0% 10%)', borderTop: '2px solid hsl(0 0% 17%)' }}>
                    <tr>
                      <td colSpan="4" className="py-3 px-4 text-sm font-bold text-right uppercase" style={{ color: 'hsl(0 0% 70%)' }}>Page Totals:</td>
                      <td className="py-3 px-4 text-sm font-bold text-right" style={{ color: 'hsl(45 93% 47%)' }}>
                        {formatKES(allSales.reduce((sum, s) => sum + s.totalPrice, 0))}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-right" style={{ color: 'hsl(142 71% 45%)' }}>
                        +{formatKES(allSales.reduce((sum, s) => sum + s.profit, 0))}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Staff Management Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>Staff Management</h2>
              <p className="text-sm" style={{ color: 'hsl(0 0% 54%)' }}>Manage user accounts and permissions</p>
            </div>
            <button 
              onClick={() => setAddStaffModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition"
              style={{ backgroundColor: 'hsl(45 93% 47%)', color: 'hsl(0 0% 0%)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(45 93% 42%)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(45 93% 47%)'}
            >
              <UserPlus className="h-4 w-4" />
              Add New Staff
            </button>
          </div>

          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'hsl(0 0% 10%)' }}>
                <tr>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Email</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Role</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Created</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 54%)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers && staffMembers.length > 0 ? (
                  staffMembers.map((staff, idx) => (
                    <tr 
                      key={staff._id} 
                      className="transition"
                      style={{ 
                        backgroundColor: idx % 2 === 0 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 10% / 0.5)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(0 0% 15%)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'hsl(0 0% 10%)' : 'hsl(0 0% 10% / 0.5)'}
                    >
                      <td className="py-3 px-4 font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>
                        {staff.email}
                        {staff._id === user?._id && (
                          <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'hsl(45 93% 47% / 0.2)', color: 'hsl(45 93% 47%)' }}>
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          className="text-xs px-3 py-1 rounded-full capitalize font-semibold"
                          style={{ 
                            backgroundColor: staff.role === 'admin' ? 'hsl(45 93% 47% / 0.2)' : 'hsl(217 91% 60% / 0.2)',
                            color: staff.role === 'admin' ? 'hsl(45 93% 47%)' : 'hsl(217 91% 60%)'
                          }}
                        >
                          {staff.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'hsl(0 0% 54%)' }}>
                        {new Date(staff.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditStaffModal(staff)}
                            className="p-2 rounded-lg transition inline-flex items-center justify-center"
                            style={{ backgroundColor: 'transparent', border: '1px solid hsl(45 93% 47% / 0.3)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(45 93% 47% / 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" style={{ color: 'hsl(45 93% 47%)' }} />
                          </button>
                          {staff._id !== user?._id && (
                            <button 
                              onClick={() => handleDeleteStaff(staff._id, staff.email)}
                              className="p-2 rounded-lg transition inline-flex items-center justify-center"
                              style={{ backgroundColor: 'transparent', border: '1px solid hsl(0 84% 60% / 0.3)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(0 84% 60% / 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" style={{ color: 'hsl(0 84% 60%)' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center" style={{ color: 'hsl(0 0% 54%)' }}>
                      No staff members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="max-w-md w-full rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid hsl(0 0% 17%)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>Edit Product</h2>
              <button 
                onClick={() => { 
                  setEditProductModalOpen(false); 
                  setSelectedProduct(null);
                  setProductForm({ name: '', category: '', price: '', costPrice: '', quantity: '', description: '' }); 
                }} 
                className="text-3xl leading-none hover:opacity-70 transition" 
                style={{ color: 'hsl(0 0% 54%)' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
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
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Quantity *</label>
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
                    setEditProductModalOpen(false); 
                    setSelectedProduct(null);
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

      {/* Add Staff Modal */}
      {addStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="max-w-md w-full rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid hsl(0 0% 17%)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>Add New Staff Member</h2>
              <button 
                onClick={() => { 
                  setAddStaffModalOpen(false); 
                  setStaffForm({ email: '', password: '', role: 'manager' }); 
                }} 
                className="text-3xl leading-none hover:opacity-70 transition" 
                style={{ color: 'hsl(0 0% 54%)' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Email *</label>
                <input 
                  type="email" 
                  value={staffForm.email} 
                  onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  placeholder="staff@vibeslounge.co.ke"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Password *</label>
                <input 
                  type="password" 
                  value={staffForm.password} 
                  onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Role *</label>
                <select 
                  value={staffForm.role} 
                  onChange={(e) => setStaffForm({...staffForm, role: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  required
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs mt-2" style={{ color: 'hsl(0 0% 54%)' }}>
                  Managers can only make sales. Admins have full access.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { 
                    setAddStaffModalOpen(false); 
                    setStaffForm({ email: '', password: '', role: 'manager' }); 
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
                    'Add Staff Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editStaffModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="max-w-md w-full rounded-lg" style={{ backgroundColor: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 17%)' }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid hsl(0 0% 17%)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'hsl(0 0% 98%)' }}>Edit Staff Member</h2>
              <button 
                onClick={() => { 
                  setEditStaffModalOpen(false); 
                  setSelectedStaff(null);
                  setEditStaffForm({ email: '', password: '', role: 'manager' }); 
                }} 
                className="text-3xl leading-none hover:opacity-70 transition" 
                style={{ color: 'hsl(0 0% 54%)' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Email *</label>
                <input 
                  type="email" 
                  value={editStaffForm.email} 
                  onChange={(e) => setEditStaffForm({...editStaffForm, email: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>
                  New Password (leave blank to keep current)
                </label>
                <input 
                  type="password" 
                  value={editStaffForm.password} 
                  onChange={(e) => setEditStaffForm({...editStaffForm, password: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  placeholder="Minimum 6 characters if changing"
                  minLength="6"
                />
                <p className="text-xs mt-1" style={{ color: 'hsl(0 0% 54%)' }}>
                  Only fill this if you want to change the password
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'hsl(0 0% 70%)' }}>Role *</label>
                <select 
                  value={editStaffForm.role} 
                  onChange={(e) => setEditStaffForm({...editStaffForm, role: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg text-sm" 
                  style={{ backgroundColor: 'hsl(0 0% 6%)', border: '1px solid hsl(0 0% 17%)', color: 'hsl(0 0% 98%)', outline: 'none' }} 
                  required
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { 
                    setEditStaffModalOpen(false); 
                    setSelectedStaff(null);
                    setEditStaffForm({ email: '', password: '', role: 'manager' }); 
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
                      Updating...
                    </>
                  ) : (
                    'Update Staff Member'
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

export default AdminDashboard;