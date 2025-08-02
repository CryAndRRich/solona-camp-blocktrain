import { useProgram } from "@/hooks/use-program";
import { getTodoPDA } from "@/utils/get-pda";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TodoItem({
  profileKey,
  content,
  index,
  completed,
  reload,
}: {
  profileKey: string;
  content: string;
  index: number;
  completed: boolean;
  reload: () => void;
}) {
  const { toast } = useToast();
  const program = useProgram();

  const handleToggle = async () => {
    try {
      const [todoPDA] = getTodoPDA(profileKey, index);
      await program.methods
        .toggleTodo()
        .accounts({ todo: todoPDA })
        .rpc();
      toast({ title: "Toggled todo!" });
      reload();
    } catch (err: any) {
      toast({ title: "Failed to toggle", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex justify-between items-center border p-2 rounded">
      <span className={completed ? "line-through" : ""}>{content}</span>
      <Button variant="outline" size="icon" onClick={handleToggle}>
        {completed ? <X size={16} /> : <Check size={16} />}
      </Button>
    </div>
  );
}
