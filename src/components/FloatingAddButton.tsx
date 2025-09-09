import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingAddButtonProps {
  onClick: () => void;
}

const FloatingAddButton = ({ onClick }: FloatingAddButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="floating"
      size="icon"
      className="fixed bottom-6 right-6 w-14 h-14 z-50"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default FloatingAddButton;