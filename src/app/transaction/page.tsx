import { TransactionQueryComponent } from '@/components/transaction-query'

export default function TransactionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent drop-shadow-sm animate-fade-in">
        Tra cứu dữ liệu "Sao Kê" của MTTQ VN
      </h1>
      <TransactionQueryComponent />
    </main>
  )
} 