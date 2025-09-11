import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useHabitApp } from '@/providers/habitContext'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddCategoryModal({ open, onOpenChange }: Props) {
  const { addCategory } = useHabitApp()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
    }
  }, [open])

  const onCreate = () => {
    if (!name.trim()) return
    const c = addCategory(name.trim(), undefined, description.trim() || undefined)
    toast({ title: 'Catégorie ajoutée', description: c.name })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle catégorie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nom</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Santé" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description (optionnel)</Label>
            <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Quelques détails..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={onCreate} disabled={!name.trim()}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
