import { useToast } from "@/hooks/use-toast";

const createToast = () => {
    const {toast} = useToast()
    const createError = (description: string, title ="Uh oh! Something went wrong.") => {
        toast({
            variant: "destructive",
            title,
            description,
            
          })
    }
    const createSimple = (description: string, title?: string) => {
        if(title) {
            toast({
                title,
                description,
              })
        } else {
            toast({
                description,
              })
        }
    } 

  return {createError, createSimple}
}

export default createToast