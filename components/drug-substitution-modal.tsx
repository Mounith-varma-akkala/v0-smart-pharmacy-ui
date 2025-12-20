'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, XCircle, Pill, Building, DollarSign } from 'lucide-react'

interface DrugSubstitute {
  id: string
  name: string
  manufacturer: string
  composition: string
  strength: string
  form: string
  price: number
  stock_quantity: number
  equivalency_score: number
  substitution_notes: string
  contraindications: string[]
  requires_prescription: boolean
}

interface DrugSubstitutionModalProps {
  isOpen: boolean
  onClose: () => void
  originalDrug: {
    id: string
    name: string
    composition: string
    requiredQuantity: number
  }
  onSubstitutionConfirmed: (substitute: DrugSubstitute, quantity: number) => void
}

export default function DrugSubstitutionModal({
  isOpen,
  onClose,
  originalDrug,
  onSubstitutionConfirmed
}: DrugSubstitutionModalProps) {
  const [substitutes, setSubstitutes] = useState<DrugSubstitute[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubstitute, setSelectedSubstitute] = useState<DrugSubstitute | null>(null)
  const [pharmacistConfirmation, setPharmacistConfirmation] = useState(false)

  useEffect(() => {
    if (isOpen && originalDrug.id) {
      fetchSubstitutes()
    }
  }, [isOpen, originalDrug.id])

  const fetchSubstitutes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/drugs/substitutes/${originalDrug.id}`)
      const data = await response.json()
      setSubstitutes(data.substitutes || [])
    } catch (error) {
      console.error('Error fetching substitutes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubstitutionConfirm = async () => {
    if (!selectedSubstitute || !pharmacistConfirmation) return

    try {
      // Log the substitution for audit
      await fetch('/api/drugs/log-substitution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_drug_id: originalDrug.id,
          substitute_drug_id: selectedSubstitute.id,
          quantity: originalDrug.requiredQuantity,
          pharmacist_confirmed: true,
          reason: 'out_of_stock'
        })
      })

      onSubstitutionConfirmed(selectedSubstitute, originalDrug.requiredQuantity)
      onClose()
    } catch (error) {
      console.error('Error confirming substitution:', error)
      alert('Failed to confirm substitution')
    }
  }

  const getEquivalencyColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getEquivalencyLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match'
    if (score >= 70) return 'Good Match'
    return 'Caution Required'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Drug Substitution Required
          </DialogTitle>
          <DialogDescription>
            <strong>{originalDrug.name}</strong> is out of stock. Please review and confirm a suitable substitute.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Drug Info */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg">Original Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Drug Name</p>
                  <p className="font-medium">{originalDrug.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Composition</p>
                  <p className="font-medium">{originalDrug.composition}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Required Quantity</p>
                  <p className="font-medium">{originalDrug.requiredQuantity} units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Substitutes List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : substitutes.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Substitutes</h3>
              {substitutes.map((substitute) => (
                <Card 
                  key={substitute.id}
                  className={`cursor-pointer transition-all ${
                    selectedSubstitute?.id === substitute.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedSubstitute(substitute)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{substitute.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {substitute.manufacturer}
                        </CardDescription>
                      </div>
                      <Badge className={getEquivalencyColor(substitute.equivalency_score)}>
                        {substitute.equivalency_score}% - {getEquivalencyLabel(substitute.equivalency_score)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Composition</p>
                        <p className="font-medium text-sm">{substitute.composition}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Strength</p>
                        <p className="font-medium">{substitute.strength}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Form</p>
                        <p className="font-medium">{substitute.form}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <p className={`font-medium ${
                          substitute.stock_quantity >= originalDrug.requiredQuantity 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {substitute.stock_quantity} units
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price per Unit</p>
                        <p className="font-medium flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ₹{substitute.price}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Prescription Required</p>
                        <p className="font-medium">
                          {substitute.requires_prescription ? (
                            <Badge variant="outline" className="text-red-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>

                    {substitute.substitution_notes && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Substitution Notes</p>
                        <p className="text-sm bg-blue-50 p-2 rounded">{substitute.substitution_notes}</p>
                      </div>
                    )}

                    {substitute.contraindications.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Contraindications</p>
                        <div className="flex flex-wrap gap-1">
                          {substitute.contraindications.map((contraindication, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {contraindication}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {substitute.stock_quantity < originalDrug.requiredQuantity && (
                      <Alert className="mt-4 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Insufficient stock. Only {substitute.stock_quantity} units available, 
                          but {originalDrug.requiredQuantity} units required.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Substitutes Available</h3>
              <p className="text-muted-foreground">No equivalent drugs found for this medication</p>
            </div>
          )}

          {/* Pharmacist Confirmation */}
          {selectedSubstitute && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Pharmacist Confirmation Required</CardTitle>
                <CardDescription>
                  Please review the selected substitute and confirm the substitution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded border">
                  <h4 className="font-medium mb-2">Selected Substitute:</h4>
                  <p className="text-lg font-semibold">{selectedSubstitute.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubstitute.manufacturer} • {selectedSubstitute.equivalency_score}% match
                  </p>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> By confirming this substitution, you acknowledge that:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>You have reviewed the drug composition and equivalency</li>
                      <li>You have checked for any contraindications</li>
                      <li>The patient has been informed about the substitution</li>
                      <li>This substitution is clinically appropriate</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pharmacist-confirmation"
                    checked={pharmacistConfirmation}
                    onChange={(e) => setPharmacistConfirmation(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="pharmacist-confirmation" className="text-sm font-medium">
                    I confirm this substitution as a licensed pharmacist
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubstitutionConfirm}
              disabled={!selectedSubstitute || !pharmacistConfirmation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Substitution
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}