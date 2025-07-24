import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const CREDIT_TERMS = ["Due on receipt", "Due in 7 days", "Due in 15 days", "Due in 30 days"];
const PAYMENT_MODES = ["UPI", "Bank Transfer", "Cash", "Cheque"];
const LITERACY_FACTS = [
  "Did you know? Offering clear credit terms can improve your cash flow!",
  "Did you know? Keeping digital records of invoices helps at tax time.",
  "Did you know? GSTIN is mandatory for businesses with turnover above ₹40 lakh.",
  "Did you know? Accepting digital payments can reduce late payments.",
  "Did you know? Reconciling invoices monthly helps avoid errors.",
  "Did you know? You can claim GST input credit on business expenses.",
];

function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

const InvoiceTab: React.FC = () => {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [client, setClient] = useState("");
  const [items, setItems] = useState([{ description: "", amount: "" }]);
  const [gst, setGst] = useState("");
  const [creditTerm, setCreditTerm] = useState(CREDIT_TERMS[1]);
  const [paymentMode, setPaymentMode] = useState("");
  const [showGstWarning, setShowGstWarning] = useState(false);
  const [showPaymentTip, setShowPaymentTip] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // GST validation (simple: must be 15 chars)
  const handleGstChange = (val: string) => {
    setGst(val);
    setShowGstWarning(val.length > 0 && val.length !== 15);
  };

  // Add/remove invoice items
  const handleAddItem = () => setItems([...items, { description: "", amount: "" }]);
  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const handleItemChange = (idx: number, field: string, value: string) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Payment mode tip
  const handlePaymentModeFocus = () => setShowPaymentTip(true);
  const handlePaymentModeBlur = () => setShowPaymentTip(false);

  // Invoice submit
  const handleSubmit = () => {
    if (!client || !items[0].description || !items[0].amount) {
      Alert.alert("Missing info", "Please fill client and at least one item.");
      return;
    }
    // Save invoice to allInvoices
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const gstAmount = gst && gst.length === 15 ? subtotal * 0.18 : 0;
    const grandTotal = subtotal + gstAmount;
    const invoiceData = {
      invoiceNo,
      client,
      gst,
      creditTerm,
      paymentMode,
      items,
      subtotal,
      gstAmount,
      grandTotal,
      date: getTodayString(),
    };
    setAllInvoices([invoiceData, ...allInvoices]);
    setSelectedInvoice(invoiceData);
    setShowPreview(true);
  };

  // Rotate literacy fact
  const handleNextFact = () => setFactIndex((prev) => (prev + 1) % LITERACY_FACTS.length);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const gstAmount = gst && gst.length === 15 ? subtotal * 0.18 : 0; // Assume 18% GST if GSTIN is valid
  const grandTotal = subtotal + gstAmount;

  // View all invoices
  const handleViewAll = () => setShowAllModal(true);
  const handleSelectInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    setShowPreview(true);
    setShowAllModal(false);
  };

  // PDF Generation
  const handleDownloadPdf = async () => {
    const inv = selectedInvoice;
    if (!inv) return;
    setIsGeneratingPdf(true);
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            .header { text-align: center; color: #008080; font-size: 24px; font-weight: bold; margin-bottom: 12px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .section { font-weight: bold; color: #2C3E50; font-size: 16px; margin-top: 12px; margin-bottom: 4px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .table th, .table td { border: 1px solid #eee; padding: 8px; text-align: left; }
            .table th { background: #f0f0f0; }
            .summary { margin-top: 12px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .total { color: #008080; font-weight: bold; font-size: 17px; }
          </style>
        </head>
        <body>
          <div class="header">Invoice</div>
          <div class="row"><div>Invoice No:</div><div>${inv.invoiceNo}</div></div>
          <div class="row"><div>Client:</div><div>${inv.client}</div></div>
          <div class="row"><div>GSTIN:</div><div>${inv.gst || '-'}</div></div>
          <div class="row"><div>Credit Terms:</div><div>${inv.creditTerm}</div></div>
          <div class="row"><div>Payment Mode:</div><div>${inv.paymentMode || '-'}</div></div>
          <div class="row"><div>Date:</div><div>${inv.date}</div></div>
          <div class="section">Items</div>
          <table class="table">
            <tr><th>Description</th><th>Amount</th></tr>
            ${inv.items.map((item: any) => `<tr><td>${item.description}</td><td>₹${item.amount}</td></tr>`).join('')}
          </table>
          <div class="summary">
            <div class="summary-row"><div>Subtotal:</div><div>₹${inv.subtotal.toFixed(2)}</div></div>
            <div class="summary-row"><div>GST (18%):</div><div>₹${inv.gstAmount.toFixed(2)}</div></div>
            <div class="summary-row total"><div>Grand Total:</div><div>₹${inv.grandTotal.toFixed(2)}</div></div>
          </div>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (Platform.OS === 'web') {
        window.open(uri, '_blank');
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('PDF generated', 'PDF file created at: ' + uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF.');
    }
    setIsGeneratingPdf(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Invoice Generator</Text>
        <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAll}>
          <Ionicons name="albums" size={20} color="#008080" />
          <Text style={styles.viewAllBtnText}>View All Invoices</Text>
        </TouchableOpacity>
      </View>
      {/* Financial Literacy Fact */}
      <View style={styles.factBox}>
        <Ionicons name="bulb" size={24} color="#b8860b" style={{ marginRight: 10 }} />
        <Text style={styles.factText}>{LITERACY_FACTS[factIndex]}</Text>
        <TouchableOpacity onPress={handleNextFact} style={styles.factNextBtn}>
          <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Invoice Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}><Ionicons name="document-text-outline" size={20} color="#008080" /><Text style={styles.cardHeaderText}>Invoice Details</Text></View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Invoice No.</Text>
          <TextInput style={styles.input} value={invoiceNo} onChangeText={setInvoiceNo} placeholder="e.g. INV-001" />
          <Text style={styles.eduTip}>Why? Unique invoice numbers help you track payments and avoid confusion.</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Client Name</Text>
          <TextInput style={styles.input} value={client} onChangeText={setClient} placeholder="e.g. Acme Corp" />
          <Text style={styles.eduTip}>Why? Always record the client name for legal and accounting purposes.</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>GSTIN</Text>
          <TextInput style={styles.input} value={gst} onChangeText={handleGstChange} placeholder="15-char GSTIN" maxLength={15} />
          {showGstWarning && <Text style={styles.warning}>⚠️ GSTIN should be 15 characters.</Text>}
          <Text style={styles.eduTip}>GSTIN is required for GST-registered businesses. It helps with tax compliance and input credit.</Text>
        </View>
      </View>
      {/* Items Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}><Ionicons name="list" size={20} color="#008080" /><Text style={styles.cardHeaderText}>Invoice Items</Text></View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <TextInput
              style={[styles.input, { flex: 2, marginRight: 8 }]}
              value={item.description}
              onChangeText={val => handleItemChange(idx, "description", val)}
              placeholder="Description"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={item.amount}
              onChangeText={val => handleItemChange(idx, "amount", val)}
              placeholder="Amount"
              keyboardType="numeric"
            />
            {items.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveItem(idx)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem}>
          <Text style={styles.addItemBtnText}>+ Add Item</Text>
        </TouchableOpacity>
        <Text style={styles.eduTip}>Tip: List all products/services clearly for transparency and dispute avoidance.</Text>
      </View>
      {/* Credit Terms Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}><Ionicons name="calendar" size={20} color="#008080" /><Text style={styles.cardHeaderText}>Credit Terms</Text></View>
        <View style={styles.creditTermsRow}>
          {CREDIT_TERMS.map(term => (
            <TouchableOpacity
              key={term}
              style={[styles.creditTermBtn, creditTerm === term && styles.creditTermBtnActive]}
              onPress={() => setCreditTerm(term)}
            >
              <Text style={[styles.creditTermText, creditTerm === term && styles.creditTermTextActive]}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.tip}>💡 Suggestion: {creditTerm}</Text>
        <Text style={styles.eduTip}>Why? Clear credit terms set payment expectations and reduce late payments.</Text>
      </View>
      {/* Payment Mode Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}><Ionicons name="cash" size={20} color="#008080" /><Text style={styles.cardHeaderText}>Payment Mode</Text></View>
        <TextInput
          style={styles.input}
          value={paymentMode}
          onChangeText={setPaymentMode}
          placeholder="e.g. UPI, Bank Transfer"
          onFocus={handlePaymentModeFocus}
          onBlur={handlePaymentModeBlur}
        />
        {showPaymentTip && <Text style={styles.tip}>💡 Add UPI or Bank details for faster payment!</Text>}
        <Text style={styles.eduTip}>Best Practice: Offer multiple payment modes to make it easy for clients to pay you.</Text>
      </View>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}><Ionicons name="receipt" size={20} color="#008080" /><Text style={styles.summaryTitle}>Summary</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal:</Text><Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>GST (18%):</Text><Text style={styles.summaryValue}>₹{gstAmount.toFixed(2)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabelTotal}>Grand Total:</Text><Text style={styles.summaryValueTotal}>₹{grandTotal.toFixed(2)}</Text></View>
      </View>
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Generate Invoice</Text>
      </TouchableOpacity>

      {/* Invoice Preview Modal */}
      <Modal visible={showPreview} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.invoicePreviewCard}>
            <Text style={styles.previewTitle}>Invoice Preview</Text>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Invoice No:</Text><Text style={styles.previewValue}>{selectedInvoice?.invoiceNo || invoiceNo}</Text></View>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Client:</Text><Text style={styles.previewValue}>{selectedInvoice?.client || client}</Text></View>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>GSTIN:</Text><Text style={styles.previewValue}>{selectedInvoice?.gst || gst || '-'}</Text></View>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Credit Terms:</Text><Text style={styles.previewValue}>{selectedInvoice?.creditTerm || creditTerm}</Text></View>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Payment Mode:</Text><Text style={styles.previewValue}>{selectedInvoice?.paymentMode || paymentMode || '-'}</Text></View>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Date:</Text><Text style={styles.previewValue}>{selectedInvoice?.date || getTodayString()}</Text></View>
            <Text style={[styles.previewSection, {marginTop: 10}]}>Items</Text>
            {(selectedInvoice?.items || items).map((item: any, idx: number) => (
              <View key={idx} style={styles.previewRow}>
                <Text style={styles.previewValue}>{item.description}</Text>
                <Text style={styles.previewValue}>₹{item.amount}</Text>
              </View>
            ))}
            <View style={styles.previewDivider} />
            <View style={styles.previewRow}><Text style={styles.previewLabel}>Subtotal:</Text><Text style={styles.previewValue}>₹{selectedInvoice?.subtotal?.toFixed(2) ?? subtotal.toFixed(2)}</Text></View>
            <View style={styles.previewRow}><Text style={styles.previewLabel}>GST (18%):</Text><Text style={styles.previewValue}>₹{selectedInvoice?.gstAmount?.toFixed(2) ?? gstAmount.toFixed(2)}</Text></View>
            <View style={styles.previewRow}><Text style={styles.previewLabelTotal}>Grand Total:</Text><Text style={styles.previewValueTotal}>₹{selectedInvoice?.grandTotal?.toFixed(2) ?? grandTotal.toFixed(2)}</Text></View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPreview(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPdf} disabled={isGeneratingPdf}>
              <Ionicons name="download" size={18} color="#fff" style={{marginRight: 6}} />
              <Text style={styles.downloadBtnText}>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* All Invoices Modal */}
      <Modal visible={showAllModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.allInvoicesCard}>
            <Text style={styles.previewTitle}>All Invoices</Text>
            <FlatList
              data={allInvoices}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.invoiceListItem} onPress={() => handleSelectInvoice(item)}>
                  <View style={{flex:1}}>
                    <Text style={styles.invoiceListNo}>{item.invoiceNo || 'No Number'}</Text>
                    <Text style={styles.invoiceListClient}>{item.client}</Text>
                  </View>
                  <View style={{alignItems:'flex-end'}}>
                    <Text style={styles.invoiceListDate}>{item.date}</Text>
                    <Text style={styles.invoiceListTotal}>₹{item.grandTotal.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.placeholder}>No invoices yet.</Text>}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAllModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ECF0F1',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 10,
    textAlign: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  viewAllBtnText: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  factBox: {
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#FFD700',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  factText: {
    color: '#b8860b',
    fontSize: 15,
    flex: 1,
  },
  factNextBtn: {
    backgroundColor: '#008080',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  factNextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardHeaderText: {
    fontWeight: 'bold',
    color: '#008080',
    fontSize: 17,
    marginLeft: 6,
  },
  tip: {
    color: '#008080',
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    fontSize: 16,
    marginBottom: 6,
  },
  warning: {
    color: '#DE3163',
    fontSize: 14,
    marginTop: 2,
    backgroundColor: '#fff0f3',
    borderRadius: 6,
    padding: 4,
    paddingHorizontal: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  removeBtn: {
    color: '#DE3163',
    fontSize: 20,
    marginLeft: 6,
  },
  addItemBtn: {
    backgroundColor: '#e0f7fa',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addItemBtnText: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 15,
  },
  creditTermsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  creditTermBtn: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  creditTermBtnActive: {
    backgroundColor: '#008080',
  },
  creditTermText: {
    color: '#008080',
    fontSize: 15,
  },
  creditTermTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eduTip: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#008080',
    fontSize: 17,
    marginLeft: 6,
  },
  summaryLabel: {
    color: '#2C3E50',
    fontSize: 15,
  },
  summaryValue: {
    color: '#2C3E50',
    fontWeight: 'bold',
    fontSize: 15,
  },
  summaryLabelTotal: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryValueTotal: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#008080',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoicePreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'stretch',
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 10,
    textAlign: 'center',
  },
  previewSection: {
    fontWeight: 'bold',
    color: '#2C3E50',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewLabel: {
    color: '#888',
    fontSize: 15,
  },
  previewValue: {
    color: '#2C3E50',
    fontSize: 15,
    fontWeight: 'bold',
  },
  previewLabelTotal: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewValueTotal: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  closeBtn: {
    backgroundColor: '#008080',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  allInvoicesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '92%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'stretch',
  },
  invoiceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  invoiceListNo: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
  },
  invoiceListClient: {
    color: '#2C3E50',
    fontSize: 14,
  },
  invoiceListDate: {
    color: '#888',
    fontSize: 13,
  },
  invoiceListTotal: {
    color: '#DE3163',
    fontWeight: 'bold',
    fontSize: 15,
  },
  placeholder: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
  },
  downloadBtn: {
    backgroundColor: '#008080',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default InvoiceTab; 