"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-api"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { Shield, User, Mail, Calendar, Briefcase, CheckCircle, XCircle, Clock } from "lucide-react"

interface AdminRequest {
  id: string
  name: string
  email: string
  date_of_birth?: string
  employee_id?: string
  status: string
  requested_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
}

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      fetchRequests()
    }
  }, [isAuthenticated, user])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAdminRequests(1, 50)
      setRequests(response.requests || [])
    } catch (error: any) {
      toast.error("Failed to fetch admin requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId)
      await apiClient.approveAdminRequest(requestId)
      toast.success("Admin request approved successfully")
      await fetchRequests()
    } catch (error: any) {
      toast.error("Failed to approve request")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRequestId) return
    
    try {
      setProcessingId(selectedRequestId)
      await apiClient.rejectAdminRequest(selectedRequestId, rejectReason)
      toast.success("Admin request rejected")
      await fetchRequests()
      setShowRejectDialog(false)
      setRejectReason("")
      setSelectedRequestId(null)
    } catch (error: any) {
      toast.error("Failed to reject request")
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectDialog = (requestId: string) => {
    setSelectedRequestId(requestId)
    setShowRejectDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600"><CheckCircle className="w-3 h-3" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated || user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need Super Admin privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Request Approvals</h1>
        <p className="text-muted-foreground">Review and approve admin access requests</p>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground">There are no admin requests to review at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {request.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {request.email}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {request.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Date of Birth:</span>
                      <span>{formatDate(request.date_of_birth)}</span>
                    </div>
                  )}
                  {request.employee_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Job Role:</span>
                      <span>{request.employee_id}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Requested:</span>
                    <span>{formatDate(request.requested_at)}</span>
                  </div>
                  {request.reviewed_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Reviewed:</span>
                      <span>{formatDate(request.reviewed_at)}</span>
                    </div>
                  )}
                </div>

                {request.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {request.rejection_reason}
                    </p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingId === request.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(request.id)}
                      disabled={processingId === request.id}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Admin Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this admin request. This will help the applicant understand why their request was denied.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Rejection Reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectReason.trim()}
            >
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}