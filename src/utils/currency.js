const formatKES = (amount) => {
    if (amount === null || amount === undefined) return 'KES 0';
  
    // Sanitize input: extract/clean number from strings (removes KES, commas, quotes, braces, semicolons, etc.)
    let num = 0;
    if (typeof amount === 'string') {
      num = parseFloat(amount.replace(/[^\d.]/g, '')) || 0;  // Keeps only digits/decimals
    } else {
      num = Number(amount) || 0;
    }
  
    return `KES ${num.toLocaleString('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };
  
  export { formatKES };