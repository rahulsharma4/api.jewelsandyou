const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateInvoice = async (order, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Pipe the PDF into the response
      doc.pipe(res);

      // Add company logo or header
      doc.fontSize(20).text('Jewels And You', 50, 45, { align: 'right' });
      doc.fontSize(10).text('Invoice', 50, 70, { align: 'right' });

      // Add order details
      doc.fontSize(12).text(`Order ID: ${order._id}`, 50, 100);
      doc.fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 115);
      doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, 130);
      
      if (order.paymentInfo?.method) {
        doc.text(`Payment Gateway: ${order.paymentInfo.method.toUpperCase()}`, 50, 145);
      }

      // Add billing/shipping address
      const address = order.shippingAddress;
      doc.fontSize(12).text('Billed To:', 300, 100);
      doc.fontSize(10)
         .text(address.name || 'Customer', 300, 115)
         .text(address.address || '', 300, 130)
         .text(`${address.city || ''}, ${address.country || ''}`, 300, 145)
         .text(address.zip || '', 300, 160);

      doc.moveTo(50, 190).lineTo(550, 190).stroke();

      // Add table headers
      let y = 210;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Item', 50, y);
      doc.text('Quantity', 280, y, { width: 90, align: 'right' });
      doc.text('Price', 370, y, { width: 90, align: 'right' });
      doc.text('Total', 460, y, { width: 90, align: 'right' });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
      doc.font('Helvetica');
      y += 25;

      // Add items
      order.items.forEach(item => {
        const itemTotal = item.quantity * item.price;
        doc.text(item.product?.name || 'Product', 50, y, { width: 230 });
        doc.text(item.quantity.toString(), 280, y, { width: 90, align: 'right' });
        doc.text(`Rs. ${item.price.toLocaleString('en-IN')}`, 370, y, { width: 90, align: 'right' });
        doc.text(`Rs. ${itemTotal.toLocaleString('en-IN')}`, 460, y, { width: 90, align: 'right' });
        y += 20;
      });

      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 15;

      // Add totals
      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 370, y, { width: 90, align: 'right' });
      doc.text(`Rs. ${order.subtotal.toLocaleString('en-IN')}`, 460, y, { width: 90, align: 'right' });
      y += 20;

      if (order.discountAmount > 0) {
        doc.text('Discount:', 370, y, { width: 90, align: 'right' });
        doc.text(`-Rs. ${order.discountAmount.toLocaleString('en-IN')}`, 460, y, { width: 90, align: 'right' });
        y += 20;
      }

      doc.text('Shipping:', 370, y, { width: 90, align: 'right' });
      doc.text(`Rs. ${order.shippingCost.toLocaleString('en-IN')}`, 460, y, { width: 90, align: 'right' });
      y += 20;

      doc.fontSize(12);
      doc.text('Total:', 370, y, { width: 90, align: 'right' });
      doc.text(`Rs. ${order.total.toLocaleString('en-IN')}`, 460, y, { width: 90, align: 'right' });

      // Add footer
      doc.fontSize(10).font('Helvetica');
      doc.text('Thank you for shopping with Jewels And You!', 50, 700, { align: 'center', width: 500 });

      // Finalize PDF file
      doc.end();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
