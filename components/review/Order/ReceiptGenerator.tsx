import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export const generateAndSharePDF = async (
  order_id: string,
  paymentId: string,
  method: string,
  amount: number,
  customerPaid: number,
  changeAmount: number,
  items: { food_id: { name: string }; quantity: number; price: number }[]
) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #007bff; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Payment Receipt</h1>
        <p>Order ID: ${order_id}</p>
        <p>Payment ID: ${paymentId}</p>
        <p>Payment Method: ${method}</p>
        <p>Amount: ${formatCurrency(amount)}</p>
        <p>Customer Paid: ${formatCurrency(customerPaid)}</p>
        <p>Change: ${formatCurrency(changeAmount)}</p>
        <table>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
          ${items
            .map(
              (item) => `
              <tr>
                <td>${item.food_id.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `
            )
            .join("")}
        </table>
        <div class="summary">
          <p>Thank you for your purchase!</p>
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html: htmlContent });
  console.log("PDF saved to:", uri);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  } else {
    Alert.alert("PDF saved", `PDF file has been saved to: ${uri}`);
  }
};
