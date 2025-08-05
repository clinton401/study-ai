import {FC} from 'react'
import {Button} from "@/components/ui/button";
import {Loader} from "lucide-react"
type LoadingButtonProps ={
    isPending: boolean,
    message: string,
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link",
    loadingText?: string
    disabled: boolean
}
export const LoadingButton: FC<LoadingButtonProps> = ({isPending, message, variant="default", loadingText, disabled}) => {
  return (
    <Button type="submit" variant={variant} disabled={disabled} 
    className="w-full h-12  rounded-xl text-lg font-medium"
  >
            
            {isPending ? <>
            <Loader className="mr-1 h-4 w-4 animate-spin"/> {loadingText ? loadingText : "Please wait..."}</>: message}
      
            
          </Button>
  )
}