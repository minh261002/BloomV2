import { Plus, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
    title: string;
    description?: string;
    loadAction?: () => void;
    addAction?: () => void;
    addActionLabel?: string;
}

const PageHeading = ({ title, description, loadAction, addAction, addActionLabel }: Props) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={loadAction}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={addAction}>
                    <Plus className="mr-2 h-4 w-4" />
                    {addActionLabel}
                </Button>
            </div>
        </div>
    )
}

export default PageHeading