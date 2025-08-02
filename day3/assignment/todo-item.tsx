import { Todo } from "@/types"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { toggleTodo } from "@/lib/todo/toggle-todo"
import { useWorkspace } from "@/hooks/use-workspace"

type Props = {
  todo: Todo
  index: number
  refetch: () => void
}

export default function TodoItem({ todo, index, refetch }: Props) {
  const { toast } = useToast()
  const { wallet, program } = useWorkspace()

  const handleToggle = async () => {
    if (!wallet || !program) return

    try {
      await toggleTodo({
        wallet: wallet.publicKey,
        program,
        todoIndex: index,
      })
      toast({ title: "Todo status updated!" })
      refetch()
    } catch (err) {
      toast({ title: "Failed to toggle", variant: "destructive" })
    }
  }

  return (
    <div className="flex items-center justify-between border p-2 rounded-md shadow-sm">
      <div>
        <p className={`font-medium ${todo.completed ? "line-through text-gray-500" : ""}`}>
          {todo.content}
        </p>
      </div>
      <Button onClick={handleToggle} variant="secondary">
        {todo.completed ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
      </Button>
    </div>
  )
}
