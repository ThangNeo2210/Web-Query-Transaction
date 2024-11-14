'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Search, Calendar, DollarSign, ArrowUpDown, Download, Moon, Sun, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from "next-themes"

// Mock function to simulate database query
const mockQueryDatabase = (
  startDate: string,
  endDate: string,
  minCredit: string,
  maxCredit: string,
  searchTerm: string
) => {
  // Simulating API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = [
        { dateTime: '2023-06-01 10:30', transId: 'T001', credit: 100, detail: 'Purchase at Store A' },
        { dateTime: '2023-06-02 15:45', transId: 'T002', credit: 200, detail: 'Online payment for Service B' },
        { dateTime: '2023-06-03 09:15', transId: 'T003', credit: 150, detail: 'Subscription renewal' },
        { dateTime: '2023-06-04 14:20', transId: 'T004', credit: 300, detail: 'Refund from Store C' },
        { dateTime: '2023-06-05 11:00', transId: 'T005', credit: 50, detail: 'Coffee shop purchase' },
        { dateTime: '2023-06-06 16:30', transId: 'T006', credit: 180, detail: 'Monthly utility bill' },
        { dateTime: '2023-06-07 13:45', transId: 'T007', credit: 90, detail: 'Book store purchase' },
        { dateTime: '2023-06-08 10:00', transId: 'T008', credit: 250, detail: 'Electronics store purchase' },
        { dateTime: '2023-06-09 17:20', transId: 'T009', credit: 120, detail: 'Restaurant dinner' },
        { dateTime: '2023-06-10 12:30', transId: 'T010', credit: 75, detail: 'Gas station fill-up' },
      ].filter(transaction => {
        const date = new Date(transaction.dateTime)
        return (
          (!startDate || date >= new Date(startDate)) &&
          (!endDate || date <= new Date(endDate)) &&
          (!minCredit || transaction.credit >= Number(minCredit)) &&
          (!maxCredit || transaction.credit <= Number(maxCredit)) &&
          (!searchTerm || transaction.detail.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })
      resolve(results)
    }, 1000) // Simulate 1 second delay
  })
}

const fetchTransactionData = async (
  startDate: string,
  endDate: string,
  minCredit: string,
  maxCredit: string,
  searchTerm: string
) => {
  try {
    // Replace with your actual API endpoint
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transactions`
    
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(minCredit && { minCredit: minCredit.toString() }),
      ...(maxCredit && { maxCredit: maxCredit.toString() }),
      ...(searchTerm && { searchTerm })
    })

    const response = await fetch(`${apiUrl}?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch transaction data')
    }

    const data = await response.json()
    
    // Ensure the API response matches our expected format
    return data.map((item: any) => ({
      dateTime: item.dateTime || item.date_time || '', // handle different possible API formats
      transId: item.transId || item.transaction_id || '',
      credit: Number(item.credit || 0),
      detail: item.detail || item.description || ''
    }))
  } catch (error) {
    console.error('Error fetching transaction data:', error)
    throw error
  }
}

interface Transaction {
  dateTime: string;
  transId: string;
  credit: number;
  detail: string;
}

export function TransactionQueryComponent() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minCredit, setMinCredit] = useState('')
  const [maxCredit, setMaxCredit] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Define itemsPerPage as a constant
  const itemsPerPage = 10

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const queryResults = await mockQueryDatabase(startDate, endDate, minCredit, maxCredit, searchTerm)
      setResults(queryResults as Transaction[])
      setCurrentPage(1)
    } catch (err) {
      setError('An error occurred while fetching the data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn as keyof Transaction]
    const bValue = b[sortColumn as keyof Transaction]
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(results.length / itemsPerPage)

  const exportToCSV = () => {
    const headers = ['Date & Time', 'Transaction ID', 'Credit', 'Detail']
    const csvContent = [
      headers.join(','),
      ...results.map(row => [row.dateTime, row.transId, row.credit, `"${row.detail}"`].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'transaction_results.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8 transition-colors duration-200">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary"></h1>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="data-[state=checked]:bg-primary"
                />
                <Moon className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle dark mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card className="bg-card text-card-foreground shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Tìm Kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {isFilterExpanded ? 'Hide Filters' : 'Show Filters'}
                {isFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="minCredit">Min Credit</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minCredit"
                        type="number"
                        value={minCredit}
                        onChange={(e) => setMinCredit(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxCredit">Max Credit</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="maxCredit"
                        type="number"
                        value={maxCredit}
                        onChange={(e) => setMaxCredit(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="searchTerm">Search Details</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="searchTerm"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search transaction details..."
                      className="pl-8"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {isLoading ? 'Đang Tìm Kiếm...' : 'Tìm Kiếm Giao Dịch'}
                </Button>
              </form>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="bg-card text-card-foreground shadow-lg border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Kết Quả Tìm Kiếm</CardTitle>
                <CardDescription>Found {results.length} transactions</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={exportToCSV} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download results as CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="dateTime"
                    stroke={theme === "dark" ? "#94a3b8" : "#475569"}
                  />
                  <YAxis
                    stroke={theme === "dark" ? "#94a3b8" : "#475569"}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                      border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(0, 0, 0, 0.2)",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="credit" 
                    stroke={theme === "dark" ? "#60a5fa" : "#2563eb"}
                    strokeWidth={2}
                    dot={{ fill: theme === "dark" ? "#60a5fa" : "#2563eb" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="cursor-pointer" onClick={() => handleSort('dateTime')}>
                      Date & Time {sortColumn === 'dateTime' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('transId')}>
                      Transaction ID {sortColumn === 'transId' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('credit')}>
                      Credit {sortColumn === 'credit' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('detail')}>
                      Detail {sortColumn === 'detail' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.map((transaction) => (
                    <TableRow 
                      key={transaction.transId} 
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell>{transaction.dateTime}</TableCell>
                      <TableCell>{transaction.transId}</TableCell>
                      <TableCell>{transaction.credit}</TableCell>
                      <TableCell>{transaction.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}