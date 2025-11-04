// Format number as Kenya Shillings
export const formatKES = (amount) => {
    if (amount === null || amount === undefined) return 'KES 0';
    
    return `KES ${Number(amount).toLocaleString('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };
  
  // Format date to readable format
  export const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format date with time
  export const formatDateTime = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Format time only (3:45 PM)
  export const formatTime = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Calculate profit
  export const calculateProfit = (sellingPrice, costPrice, quantity) => {
    return (sellingPrice - costPrice) * quantity;
  };
  
  // Get status color class
  export const getStatusColor = (status) => {
    const colors = {
      unpaid: 'bg-red-500/20 text-red-400',
      partially_paid: 'bg-yellow-500/20 text-yellow-400',
      paid: 'bg-green-500/20 text-green-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };
  
  // Get stock level color
  export const getStockColor = (quantity) => {
    if (quantity < 5) return 'text-red-400 bg-red-500/20';
    if (quantity <= 10) return 'text-yellow-400';
    return 'text-green-400';
  };
  
  // Validate email
  export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Validate phone (Kenyan format)
  export const isValidKenyanPhone = (phone) => {
    const re = /^(\+254|0)[17]\d{8}$/;
    return re.test(phone);
  };
  
  // Format phone number
  export const formatPhone = (phone) => {
    if (!phone) return '';
    // Convert 0712345678 to +254712345678
    if (phone.startsWith('0')) {
      return '+254' + phone.slice(1);
    }
    return phone;
  };