const options = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

const formatDate = (isoStr) => {
  const date = new Date(isoStr);
  return date.toLocaleString("en-US", options);
};

const formatCurrency = (amountInUSD) => {
  const exchangeRate = 91;
  const amountInINR = amountInUSD * exchangeRate;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amountInINR);
};

export { formatDate, formatCurrency };
